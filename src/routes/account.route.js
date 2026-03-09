import express from "express";
import accountController from "../controllers/account.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/*
 * - POST /api/accounts/
 * - Create a new account
 * - Access: Private
 */
router.post(
  "/",
  authMiddleware.authMiddleware,
  accountController.createAccountController,
);

/**
 *
 * GET /api/accounts
 * - Get all the accounts of the logged in users
 * - Access: Private, Protected Route
 */

router.get(
  "/",
  authMiddleware.authSystemUserMiddleware,
  accountController.getAllUserAccountsController,
);

/**
 * GET /api/accounts/:id
 * - Get account details by account ID
 * - Access: Private, Protected Route
 */

router.get(
  "/user/:id",
  authMiddleware.authMiddleware,
  accountController.getAccountByIdController,
);

/**
 * GET /api/accounts/balance/:accountId
 * - Get the balance of the logged in user's account
 *  Protected Route, Access: Private
 */

router.get(
  "/balance/:accountId",
  authMiddleware.authMiddleware,
  accountController.getAccountBalanceController,
);

export default router;
