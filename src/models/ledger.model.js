import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "Account reference is required"],
      index: true,
      immutable: true, // ledger is a historical record, so account reference should not change
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be a positive number"],
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      required: [true, "Transaction reference is required"],
      index: true,
      immutable: true,
    },
    type: {
      type: String,
      enum: {
        values: ["DEBIT", "CREDIT"],
        message: "Type must be either DEBIT or CREDIT",
      },
      required: [true, "Type is required"],
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

function preventLedgerModification() {
  throw new Error(
    "Ledger entries are immutable and cannot be modified or deleted",
  );
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);

const ledgerModel = new mongoose.model("ledger", ledgerSchema);

export default ledgerModel;
