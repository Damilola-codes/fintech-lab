import db from '../database'
import {getAllWallets, creditWallet, getWalletBalance, getWalletTransactions, debitWallet} from './walletService'
import LedgerService from './ledgerService'
import IdempotencyService from './idempotencyService'


interface TransferPayload{
    senderWalletID: string;
    receiverWalletID: string;
    amount: number;
    currency: string;
    description?: string;
    idempotencyKey: string;
}

class TransactionService {
    async processFunds(payload: TransferPayload) {
        const {senderWalletID, receiverWalletID, amount, description, idempotencyKey} = payload;

        // Check idempotency
        const existingTransaction = await IdempotencyService.check(idempotencyKey);
        if (existingTransaction?.status === 'completed') {
            return JSON.parse(existingTransaction.response_json);
        }
        if (existingTransaction?.status === 'pending') {
            throw new Error('Duplicate request in progress');
        }
        await IdempotencyService.start(idempotencyKey, payload);
        const client = await db.connect();
        try {
            await client.query('BEGIN');

                // Debit / credit wallets
                const senderBefore = await debitWallet({wallet_id: senderWalletID, amount, reference: `Transfer to ${receiverWalletID}`, metaData: {description}});
                const receiverBefore = await creditWallet({wallet_id: receiverWalletID, amount, reference: `Transfer from ${senderWalletID}`, metaData: {description}});
                

                const txResult = await client.query(
                    'INSERT INTO transactions (sender_wallet_id, receiver_wallet_id, amount, currency, description, status, idempotency_key, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
                    [senderWalletID, receiverWalletID, amount, payload.currency, description, 'completed', idempotencyKey]
                );

                await LedgerService.write({
                    transactionId: transactionId
                })