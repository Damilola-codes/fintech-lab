import { db } from "../database";
import { Transaction } from "../models/Transaction";
import { Wallet } from "../models/Wallet";
import { Request, Response } from "express";


class walletService{
    async getBalance(walletId: string, client: any){
        const res = await client.query('SELECT balance FROM wallets WHERE wallet_id = $1', [walletId]);

        return Number(res.rows[0].balance);
    }
}
export default new walletService();
export const createTransaction = async (transaction: Transaction): Promise<Transaction> => {
    const query = `
        INSERT INTO transactions (
            idempotency_key,
            reference,
            amount,
            transaction_type,
            sender_wallet_id,
            receiver_wallet_id,
            purpose,
            balance_before,
            balance_after,
            status,
            currency,
            fee,
            settlement_reference,
            accounting_category,
            channel,
            notes,
            meta_data,
            attempt_at,
            failure_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
    `;
    const values = [
        transaction.idempotencyKeyId,
        transaction.reference,
        transaction.amount,
        transaction.transactionType,
        transaction.senderWalletID,
        transaction.receiverWalletID,
        transaction.purpose,
        transaction.balanceBefore,
        transaction.balanceAfter,
        transaction.status,
        transaction.currency,
        transaction.fee,
        transaction.settlementReference,
        transaction.accountingCategory,
        transaction.channel,
        transaction.notes,
        transaction.metaData,
        transaction.attemptAt,
        transaction.failureCode
    ];
    const result = await db.query(query, values);
    return result.rows[0];
}

export const creditWallet = async ({wallet_id, amount, reference, metaData}: {wallet_id: string; amount: number; reference: string; metaData: Record<string, any>}): Promise<Transaction> => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const walletRes = await client.query('SELECT balance FROM wallets WHERE wallet_id = $1 FOR UPDATE', [wallet_id]);

        if (walletRes.rowCount === 0) {
            throw new Error('Wallet not found');
        }

        const currentBalance = Number(walletRes.rows[0].balance);
        const newBalance = currentBalance + amount;

        await client.query('UPDATE wallets SET balance = $1 WHERE wallet_id = $2', [newBalance, wallet_id]);

        await client.query(`INSERT INTO transactions (wallet_id, amount, transaction_type, reference, status, currency, channel, meta_data, balance_before, balance_after)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                            [wallet_id, amount, 'credit', reference, 'success', 'NGN', 'internal', JSON.stringify(metaData), currentBalance, newBalance]);

        await client.query('COMMIT');

        return {
            transactionID: 'dummy-id',
            reference,
            amount,
            transactionType: 'credit',
            purpose: 'funding',
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            status: 'success',
            currency: 'NGN',
            channel: 'internal',
            metaData,
            createdAt: new Date(),
            updateAt: new Date(),
            attemptAt: null,
            failureCode: null
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export const debitWallet = async ({wallet_id, amount, reference, metaData}: {wallet_id: string; amount: number; reference: string; metaData: Record<string, any>}): Promise<Transaction> => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        const walletRes = await client.query('SELECT balance FROM wallets WHERE wallet_id = $1 FOR UPDATE', [wallet_id]);
        if (walletRes.rowCount === 0) {
            throw new Error('Wallet not found');
        }
        
        const currentBalance = Number(walletRes.rows[0].balance);
        if (currentBalance < amount) {
            throw new Error('Insufficient funds');
        }
        
        const newBalance = currentBalance - amount;
        await client.query('UPDATE wallets SET balance = $1 WHERE wallet_id = $2', [newBalance, wallet_id]);
        
        const transaction: Transaction = {
            transactionID: 'dummy-id',
            reference,
            amount,
            transactionType: 'debit',
            purpose: 'funding',
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            status: 'success',
            currency: 'NGN',
            channel: 'internal',
            metaData,
            createdAt: new Date(),
            updateAt: new Date(),
            attemptAt: null,
            failureCode: null
        };
        
        await client.query(`INSERT INTO transactions (wallet_id, amount, transaction_type, reference, status, currency, channel, meta_data, balance_before, balance_after)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                            [wallet_id, amount, 'debit', reference, 'success', 'NGN', 'internal', metaData, currentBalance, newBalance]);
        
        await client.query('COMMIT');
        
        return transaction;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export const getAllWallets = async (): Promise<Wallet[]> => {
    const query = 'SELECT * FROM wallets';
    const result = await db.query(query);
    return result.rows.map(row => ({
        walletID: row.wallet_id,
        userID: row.user_id,
        walletBalance: {
            balance: Number(row.ledger_balance),
            availableBalance: Number(row.available_balance),
            lockedBalnce: Number(row.locked_balance),
        },
        currency: row.currency,
        status: row.status as Wallet['status'],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastTransaction: null, // Assuming not stored
        meta: row.meta,
        notes: row.notes,
    }));
};

export const getWalletBalance = async (req: Request, res: Response): Promise<void> => {
    const { wallet_id } = req.params;
    
    try {
        const walletRes = await db.query('SELECT balance FROM wallets WHERE wallet_id = $1', [wallet_id]);
        if (walletRes.rowCount === 0) {
            res.status(404).json({ message: 'Wallet not found' });
            return;
        }

        const credits = await db.query('SELECT COALESCE(SUM(amount), 0) AS total_credits FROM transactions WHERE receiver_wallet_id = $1 AND transaction_type = $2', [wallet_id, 'credit']);
        const debits = await db.query('SELECT COALESCE(SUM(amount), 0) AS total_debits FROM transactions WHERE sender_wallet_id = $1 AND transaction_type = $2', [wallet_id, 'debit']);

        const totalCredits = Number(credits.rows[0].total_credits);
        const totalDebits = Number(debits.rows[0].total_debits);
        const balance = totalCredits - totalDebits;

        const lastTransaction = await db.query('SELECT * FROM transactions WHERE sender_wallet_id = $1 OR receiver_wallet_id = $1 ORDER BY created_at DESC LIMIT 1', [wallet_id]);

        res.status(200).json({
            wallet_id,
            balance,
            lastTransaction: lastTransaction.rows[0] || null
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve wallet balance' });

    }
};

export const getWalletTransactions = async (req: Request, res: Response) => {
    const {wallet_id} = req.params;

    try {
        const wallet = await db.query('SELECT * FROM wallets WHERE wallet_id = $1', [wallet_id]);
        if (wallet.rowCount === 0) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        const transactions = await db.query('SELECT * FROM transactions WHERE sender_wallet_id = $1 OR receiver_wallet_id = $1 ORDER BY created_at DESC', [wallet_id]);
        return res.status(200).json(transactions.rows);
    }
    catch (error) {
        return  res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
}
