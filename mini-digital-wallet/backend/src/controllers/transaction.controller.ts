import {Request, Response} from 'express';
import TransactionService from '../services/transactionService';

class TransactionController {
    async transfer(req: Request, res: Response) {
        try {
            const { senderWalletId, receiverWalletId, amount, currency, description } = req.body;
            const idempKey = req.headers['idempotency-key'] as string;

            if (!idempKey) {
                return res.status(400).json({ error: 'Idempotency key is required' });
            }

            const transaction = await TransactionService.processFunds({
                senderWalletId,
                receiverWalletId,
                amount,
                currency,
                description,
                idempotencyKey: idempKey
            });
            
           return res.status(200).json(transaction);
        }
        catch (error: any) {
            return res.status(500).json({ error: 'Transaction failed', details: error.message });
        }
    }
}

export default new TransactionController();