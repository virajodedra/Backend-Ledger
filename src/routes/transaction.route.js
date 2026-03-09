import express from "express";
import transactionController from "../controllers/transaction.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/*
 * - POST /api/transactions/
 * - Create a new transaction
 * - Access: Private
 */
router.post(
  "/",
  authMiddleware.authMiddleware,
  transactionController.createTransaction,
);

/**
 * POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system account to a user account
 * - Access: Private ( Only system users can access this route )
 */
router.post(
  "/system/initial-funds",
  authMiddleware.authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

export default router;
