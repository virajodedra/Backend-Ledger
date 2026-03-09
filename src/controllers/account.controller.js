import accountModel from "../models/account.model.js";

async function createAccountController(req, res) {
  const user = req.user;

  const account = await accountModel.create({
    user: user._id,
  });
  await account.save();
  res.status(201).json({
    success: true,
    status: "success",
    account: account,
    message: "Account created successfully",
  });
}

async function getAllUserAccountsController(req, res) {
  const accounts = await accountModel.find({});

  if (!accounts || accounts.length === 0) {
    return res.status(404).json({
      success: false,
      status: "failed",
      message: "No accounts found for the user",
    });
  }

  res.status(200).json({
    success: true,
    status: "success",
    accounts,
  });
}

async function getAccountByIdController(req, res) {
  const accountId = req.params.id;

  const account = await accountModel.findById(accountId);

  if (!account) {
    return res.status(404).json({
      success: false,
      status: "failed",
      message: "Account not found",
    });
  }
  res.status(200).json({
    success: true,
    status: "success",
    account: account,
  });
}

async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      status: "failed",
      message: "Account not found",
    });
  }

  const balance = account.getBalance();

  res.status(200).json({
    success: true,
    status: "success",
    accountId: account._id,
    balance: balance,
  });
}

export default {
  createAccountController,
  getAllUserAccountsController,
  getAccountByIdController,
  getAccountBalanceController,
};
