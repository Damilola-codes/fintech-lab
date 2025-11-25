# fintech-lab

## Project Overview

This project is a Node.js (TypeScript) backend for a fintech wallet system. It allows users to create wallets, credit and debit balances, and track transactions. The project uses PostgreSQL as the database and Docker for easy setup.

The system is designed to be fintech-grade, with atomic operations and safe transaction handling. Multi-currency support is not included, and all balances are in NGN.
`backend/
│
├── src/
│   ├── controllers/
│   │   ├── userController.ts
│   │   ├── walletController.ts
│   │   └── transactionController.ts
│   │
│   ├── services/
│   │   ├── userService.ts
│   │   ├── walletService.ts
│   │   └── transactionService.ts
│   │
│   ├── db/
│   │   └── index.ts
│   │
│   └── app.ts
│
├── backend/sql/
│   ├── user.sql
│   ├── wallet.sql
│   └── transaction.sql
│
├── package.json
├── tsconfig.json
└── .env’

### Technologies Used
	•	Node.js with TypeScript
	•	Express
	•	PostgreSQL
	•	pg library
	•	dotenv
	•	Docker

## Database

### Docker Setup

The PostgreSQL database runs inside a Docker container. The docker-compose.yml mounts the sql folder to /docker-entrypoint-initdb.d, so all SQL files are executed automatically when the container starts.

## Tables
	•	users: Stores user information including name, email, phone, and timestamps.
	•	wallets: Stores wallet information linked to a user, with balance in NGN.
	•	transactions: Logs all wallet transactions including type (credit or debit), amounts, balances before and after, reference, and description.

## Features Implemented
	•	User creation with unique email and phone
	•	Wallet creation for each user
	•	Credit wallet with atomic transaction and ledger logging
	•	Debit wallet with atomic transaction, balance check, and ledger logging
    •	Database tables created automatically through Docker
## Backend API
	•	POST /api/users: Create a user and wallet
	•	POST /api/wallets/:wallet_id/credit: Credit a wallet
	•	POST /api/wallets/:wallet_id/debit: Debit a wallet
### Environment Variables

Create a .env file in the backend root:
``` DB_USER=postgres
    DB_PASSWORD=postgres
    DB_HOST=localhost
    DB_NAME=wallet_db
    DB_PORT=5432
    PORT=5000
```
### Running the Project
	1.	Ensure Docker is running
	2.	Start PostgreSQL container
    ``` docker compose up --build```

    3.	Start backend server
        ```npm run dev```
    4.	Test API endpoints using Postman or Insomnia

### Next Steps
	•	Implement getWalletBalance endpoint
	•	Implement getTransactions endpoint
	•	Add optional ledger table for auditing
	•	Add idempotency handling for repeated transactions
    