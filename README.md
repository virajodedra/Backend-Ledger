# 📒 Backend Ledger

A secure, production-ready **double-entry ledger & payment backend** built with Node.js, Express, and MongoDB. It supports user authentication, account management, fund transfers with idempotency protection, and email notifications — all backed by ACID-compliant MongoDB transactions.

---

## 🔗 API Documentation

[![Postman](https://img.shields.io/badge/Postman-Docs-orange?logo=postman)](https://volt-3508613.postman.co/workspace/Product-Store~7a1c9e2d-2e69-491b-870d-761872e7ed24/collection/45709614-69201ea1-17f9-4572-afd8-1b414ec7ce9f?action=share&source=copy-link&creator=45709614)

---

## ✨ Features

- 🔐 **JWT Authentication** — Cookie + Bearer token support with token blacklisting on logout
- 🏦 **Account Management** — Create and manage accounts with status tracking (`ACTIVE`, `FROZEN`, `CLOSED`)
- 💸 **Double-Entry Ledger** — Every transaction creates immutable DEBIT + CREDIT ledger entries
- 🔄 **Idempotent Transactions** — Prevent duplicate payments using idempotency keys
- ⚛️ **ACID Transactions** — All DB operations wrapped in MongoDB sessions for full atomicity
- 📧 **Email Notifications** — Sends emails on registration and transaction completion via Gmail OAuth2
- 🤖 **System User** — A special internal account for seeding initial funds

---

## 🛠️ Tech Stack

| Layer      | Technology                     |
| ---------- | ------------------------------ |
| Runtime    | Node.js (ESM)                  |
| Framework  | Express 5                      |
| Database   | MongoDB + Mongoose 9           |
| Auth       | JSON Web Tokens (jsonwebtoken) |
| Passwords  | bcryptjs                       |
| Email      | Nodemailer + Google OAuth2     |
| Config     | dotenv                         |
| Dev Server | Nodemon                        |

---

## 📁 Project Structure

```
BACKEND-LEDGER/
├── server.js                   # Entry point — connects DB & starts server
├── src/
│   ├── app.js                  # Express app setup, middleware & routes
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js          # Register, Login, Logout
│   │   ├── account.controller.js       # Account CRUD & balance
│   │   └── transaction.controller.js   # Fund transfers & initial funding
│   ├── middlewares/
│   │   └── auth.middleware.js          # JWT auth + system user guard
│   ├── models/
│   │   ├── user.model.js        # User schema with bcrypt hashing
│   │   ├── account.model.js     # Account schema with getBalance()
│   │   ├── ledger.model.js      # Immutable ledger entries
│   │   ├── transaction.model.js # Transaction lifecycle (PENDING → COMPLETED)
│   │   └── blacklist.model.js   # Invalidated JWT tokens
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── account.route.js
│   │   └── transaction.route.js
│   └── services/
│       └── email.service.js     # Nodemailer with Gmail OAuth2
├── .env.example                 # Environment variable reference
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB >= 6 (with replica set for transactions)
- A Google Cloud project with Gmail OAuth2 credentials

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd BACKEND-LEDGER

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in the values in .env

# 4. Start the development server
npm run dev
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/backend-ledger

# Auth
JWT_SECRET=your_super_secret_jwt_key
SALT_ROUNDS=10

# Email (Google OAuth2)
EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

> **Note:** MongoDB must be running as a **replica set** (even a single-node one) to support multi-document ACID transactions.

---

## 📡 API Reference

Base URL: `http://localhost:3000/api`

### 🔐 Auth

| Method | Endpoint         | Access  | Description              |
| ------ | ---------------- | ------- | ------------------------ |
| POST   | `/auth/register` | Public  | Register a new user      |
| POST   | `/auth/login`    | Public  | Login and get token      |
| POST   | `/auth/logout`   | Private | Logout & blacklist token |

### 🏦 Accounts

| Method | Endpoint                       | Access      | Description                       |
| ------ | ------------------------------ | ----------- | --------------------------------- |
| POST   | `/accounts`                    | Private     | Create a new account              |
| GET    | `/accounts`                    | System only | Get all accounts (admin)          |
| GET    | `/accounts/user/:id`           | Private     | Get account details by ID         |
| GET    | `/accounts/balance/:accountId` | Private     | Get account balance (from ledger) |

### 💸 Transactions

| Method | Endpoint                             | Access      | Description                            |
| ------ | ------------------------------------ | ----------- | -------------------------------------- |
| POST   | `/transactions`                      | Private     | Transfer funds between accounts        |
| POST   | `/transactions/system/initial-funds` | System only | Seed initial funds into a user account |

---

## 🔒 Authentication

The API supports two token delivery methods simultaneously:

- **Cookie:** `token` (HttpOnly, set automatically on login/register)
- **Bearer Token:** `Authorization: Bearer <token>` header

On logout, the token is blacklisted in the DB and is rejected for all future requests.

---

## 💡 How the Ledger Works

Every fund transfer creates **two immutable ledger entries**:

```
Transfer ₹500 from Account A → Account B

Ledger:
  Account A  |  DEBIT   |  ₹500
  Account B  |  CREDIT  |  ₹500
```

The account balance is derived at query time by aggregating all CREDIT and DEBIT entries:

```
balance = totalCredit - totalDebit
```

Ledger entries **cannot be modified or deleted** — this is enforced at the Mongoose model level via pre-hooks.

---

## 🛡️ Idempotency

Every transaction request requires a unique `idempotencyKey`. If the same key is sent again, the API:

- Returns the existing result if `COMPLETED`
- Returns a wait message if still `PENDING`
- Returns an error if `FAILED` or `REVERSED`

This prevents double-charges on network retries.

---

## 📜 Scripts

```bash
npm run dev     # Start with nodemon (hot reload)
npm start       # Start production server
```

---

## 📄 License

ISC
