import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import accountModel from "../models/account.model.js";
import userModel from "../models/user.model.js";
import emailService from "../services/email.service.js";
import mongoose from "mongoose";

/**
 *
 * @param {*} req
 * @param {*} res
 * @desc Create a new transaction for an account
 * - POST /api/transactions/
 * - Access: Private
 *
 * Steps :-
 * 1. Validate the request body for required fields (amount, type, accountId)
 * 2. validate the idempotency key to ensure the transaction is not duplicated
 * 3. check if account status is active and belongs to the authenticated user
 * 4. Derive the sender balance from ledger
 * 5. Create a new transaction ( with status PENDING )
 * 6. Create DEBIT ledger entry for the sender account
 * 7. Create CREDIT ledger entry for the receiver account
 * 8. Update the transaction status to COMPLETED
 * 9. Return the transaction details in the response ( commit MongoDB session )
 * 10. Send the email notification to the sender and receiver about the transaction
 */
async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  /**
   * 1. Validate the request body for required fields (amount, type, accountId)
   */
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message:
        " FromAccount, ToAccount, Amount and IdempotencyKey are required to create a transaction",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message: "From account not found",
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message: "To account not found",
    });
  }

  /**
   * 2. validate the idempotency key to ensure the transaction is not duplicated
   */

  const isTransactionExists = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionExists) {
    if (isTransactionExists.status === "COMPLETED") {
      return res.status(200).json({
        success: true,
        status: "success",
        message: "Transaction already processed",
        transaction: isTransactionExists,
      });
    } else if (isTransactionExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is being processed, please wait",
        transaction: isTransactionExists,
      });
    } else if (isTransactionExists.status === "FAILED") {
      return res.status(400).json({
        success: false,
        status: "failed",
        message:
          "Transaction with the same idempotency key already exists with failed status, please use a different idempotency key",
      });
    } else if (isTransactionExists.status === "REVERSED") {
      return res.status(500).json({
        success: false,
        status: "failed",
        message: "Transaction was reversed, Please retry",
      });
    }
  }

  /**
   * 3. check if account status is active and belongs to the authenticated user
   */

  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message:
        "Both sender and receiver accounts must be active to process the transaction",
    });
  }

  /**
   * 4. Derive the sender balance from ledger
   */
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message: `Insufficient balance to process the transaction. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  /**
   * 5. Create a new transaction ( with status PENDING )
   */
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create(
    [
      {
        fromAccount,
        toAccount,
        status: "PENDING",
        amount,
        idempotencyKey,
      },
    ],
    { session },
  );

  try {
    /**
     * 6. Create DEBIT ledger entry for the sender account
     *    - fromAccount is the SENDER → money goes OUT → type: "DEBIT"
     */
    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction[0]._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    // (() => {
    //   return new Promise((resolve) => {
    //     setTimeout(resolve, 100 * 1000);
    //   });
    // })();

    /**
     * 7. Create CREDIT ledger entry for the receiver account
     *    - toAccount is the RECEIVER → money comes IN → type: "CREDIT"
     */
    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction[0]._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    /**
     * 8. Update the transaction status to COMPLETED
     */
    const updatedTransaction = await transactionModel.findByIdAndUpdate(
      transaction[0]._id,
      { status: "COMPLETED" },
      { session, new: true },
    );

    /**
     * 9. Commit the MongoDB session
     */
    await session.commitTransaction();
    session.endSession();

    /**
     * 10. Send email notifications to sender and receiver
     */
    await emailService.sendTransactionCompleteEmail({
      fromAccount: fromUserAccount,
      toAccount: toUserAccount,
      amount,
      transactionId: transaction[0]._id,
    });

    return res.status(201).json({
      success: true,
      status: "success",
      message: "Transaction created successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    await transactionModel.findByIdAndUpdate(transaction[0]._id, {
      status: "FAILED",
    });

    return res.status(500).json({
      success: false,
      status: "failed",
      message: "Transaction failed due to an internal error",
      error: error.message,
    });
  }
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message:
        "ToAccount, Amount and IdempotencyKey are required to create a transaction",
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message: "To account not found",
    });
  }

  const fromUserAccount = await userModel
    .findOne({
      systemUser: true,
    })
    .select("+systemUser");

  if (!fromUserAccount) {
    return res.status(500).json({
      success: false,
      status: "failed",
      message: "System user not found, cannot process the transaction",
    });
  }

  /**
   * Validate the idempotency key to ensure the transaction is not duplicated
   */
  const isTransactionExists = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionExists) {
    if (isTransactionExists.status === "COMPLETED") {
      return res.status(200).json({
        success: true,
        status: "success",
        message: "Transaction already processed",
        transaction: isTransactionExists,
      });
    } else if (isTransactionExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is being processed, please wait",
        transaction: isTransactionExists,
      });
    } else if (isTransactionExists.status === "FAILED") {
      return res.status(400).json({
        success: false,
        status: "failed",
        message:
          "Transaction with the same idempotency key already exists with failed status, please use a different idempotency key",
      });
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let transaction;

  try {
    transaction = await transactionModel.create(
      [
        {
          fromAccount: fromUserAccount._id,
          toAccount,
          status: "PENDING",
          amount,
          idempotencyKey,
        },
      ],
      { session },
    );
    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount,
          transaction: transaction[0]._id,
          type: "DEBIT",
        },
      ],
      {
        session,
      },
    );

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction[0]._id,
          type: "CREDIT",
        },
      ],
      {
        session,
      },
    );

    const updatedTransaction = await transactionModel.findByIdAndUpdate(
      transaction[0]._id,
      { status: "COMPLETED" },
      { session, new: true },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      status: "success",
      message: "Initial funds transaction created successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    await transactionModel.findByIdAndUpdate(transaction[0]._id, {
      status: "FAILED",
    });

    return res.status(500).json({
      success: false,
      status: "failed",
      message: "Initial funds transaction failed due to an internal error",
      error: error.message,
    });
  }
}

export default { createTransaction, createInitialFundsTransaction };
