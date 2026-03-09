import express from "express";
import "dotenv/config.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

/**
 * for testing purpose only
 */
app.get("/", (req, res) => {
  res.send("Welcome to the Ledger API");
});

/**
 *
 * - Routes Required
 */
import authRoutes from "./routes/auth.routes.js";
import accountRouter from "./routes/account.route.js";
import transactionRouter from "./routes/transaction.route.js";

/**
 *
 * - Use Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

export default app;
