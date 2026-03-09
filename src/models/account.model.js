import mongoose from "mongoose";
import ledgerModel from "./ledger.model.js";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User reference is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status must be either ACTIVE, FROZEN, or CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ user: 1, status: 1 });

/**
 *
 * @returns balance
 * - return the balance of that user.
 */
accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: {
          $subtract: ["$totalCredit", "$totalDebit"],
        },
      },
    },
  ]);

  if (balanceData.length === 0) {
    return 0;
  }
  return balanceData[0].balance;
};

const accountModel = new mongoose.model("account", accountSchema);
export default accountModel;

/*
 * ============================================================
 *  MONGODB AGGREGATION PIPELINE — NOTES
 * ============================================================
 *
 *  What is an Aggregation Pipeline?
 *  ---------------------------------
 *  An aggregation pipeline is like an assembly line in a factory.
 *  You put raw documents in one end, they pass through multiple
 *  stages one by one, and you get a processed result at the end.
 *
 *  Each stage receives the output of the previous stage as its input.
 *
 *  Raw Docs → [Stage 1] → [Stage 2] → [Stage 3] → Final Result
 *
 *
 *  Common Pipeline Stages
 *  -----------------------
 *  $match   → Filter documents (like SQL WHERE)
 *  $group   → Group docs and calculate values like sum, avg, count (like SQL GROUP BY)
 *  $project → Pick, hide, rename, or compute fields (like SQL SELECT)
 *  $sort    → Sort results (like SQL ORDER BY)
 *  $limit   → Keep only the first N results (like SQL LIMIT)
 *  $skip    → Skip first N results (like SQL OFFSET)
 *  $lookup  → Join with another collection (like SQL JOIN)
 *  $unwind  → Flatten an array field into separate documents
 *  $addFields → Add new computed fields without removing existing ones
 *  $count   → Count the number of documents passing through
 *
 *
 *  The getBalance() Pipeline Explained
 *  -------------------------------------
 *
 *  STAGE 1 — $match
 *  ─────────────────
 *  { $match: { account: this._id } }
 *
 *  Filters the ledger collection and keeps only the entries
 *  that belong to THIS account. Everything else is thrown away.
 *
 *  Before $match:  all ledger records in the collection
 *  After  $match:  only records where account === this._id
 *
 *
 *  STAGE 2 — $group
 *  ─────────────────
 *  {
 *    $group: {
 *      _id: null,              ← null means: group ALL docs into one single group
 *      totalDebit:  { $sum: { $cond: [{ $eq: ["$type","DEBIT"]  }, "$amount", 0] } },
 *      totalCredit: { $sum: { $cond: [{ $eq: ["$type","CREDIT"] }, "$amount", 0] } },
 *    }
 *  }
 *
 *  Groups all matched documents into ONE object and calculates:
 *    - totalDebit  → sum of all amounts where type is "DEBIT"
 *    - totalCredit → sum of all amounts where type is "CREDIT"
 *
 *  $cond is a simple if/else:
 *    $cond: [ condition, valueIfTrue, valueIfFalse ]
 *    e.g. if type == "DEBIT" → add $amount, else add 0
 *
 *  _id in $group:
 *    _id: null        → one group for all documents (used here)
 *    _id: "$type"     → separate group per type (DEBIT group, CREDIT group)
 *    _id: "$userId"   → separate group per user
 *
 *  After $group:  [ { _id: null, totalDebit: 200, totalCredit: 800 } ]
 *
 *
 *  STAGE 3 — $project
 *  ────────────────────
 *  {
 *    $project: {
 *      _id: 0,                                    ← 0 = hide this field
 *      balance: { $subtract: ["$totalCredit", "$totalDebit"] }
 *    }
 *  }
 *
 *  Shapes the final output:
 *    - Hides _id (set to 0)
 *    - Adds a new "balance" field = totalCredit - totalDebit
 *
 *  $project field rules:
 *    field: 1  → include this field in output
 *    field: 0  → exclude this field from output
 *    field: { $operator: [...] } → compute a new value
 *
 *  After $project: [ { balance: 600 } ]
 *
 *
 *  Full Visual Flow
 *  -----------------
 *
 *  Ledger Collection (all records)
 *          |
 *          |  $match { account: this._id }
 *          ↓
 *  [{ type:"CREDIT", amount:500 }, { type:"DEBIT", amount:200 }, { type:"CREDIT", amount:300 }]
 *          |
 *          |  $group { _id:null, totalDebit: 200, totalCredit: 800 }
 *          ↓
 *  [{ _id: null, totalDebit: 200, totalCredit: 800 }]
 *          |
 *          |  $project { balance: totalCredit - totalDebit }
 *          ↓
 *  [{ balance: 600 }]
 *
 *
 *  Edge Case
 *  ----------
 *  If no ledger entries exist for this account,
 *  balanceData will be an empty array → we return 0.
 *
 * ============================================================
 */
