import { db } from "../database";
import { Transaction } from "../models/Transaction";

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

        await client.query(`INSER INTO transactions (wallet_id, amount, transaction_type, reference, status, currency, channel, meta_data, balance_before, balance_after)`)

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