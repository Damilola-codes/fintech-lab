import {Router, Request, Response} from 'express';
import { creditWallet, debitWallet, getAllWallets, getWalletBalance } from '../services/walletService';
const router = Router();

router.get('/', async (_req: Request, res: Response) => {
    try {
        const wallets = await getAllWallets();
        res.status(200).json(wallets);
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch wallets'});
    }
});

router.post('/:wallet_id/credit', async (req: Request, res: Response) => {
    try {
        const result = await creditWallet({
            wallet_id: req.params.wallet_id,
            amount: req.body.amount,
            ...req.body
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({error: 'Failed to credit wallet'});
    }
});

router.post('/:wallet_id/debit', async (req: Request, res: Response) => {
    try {
        const result = await debitWallet({
            wallet_id: req.params.wallet_id,
            amount: req.body.amount,
            ...req.body
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({error: 'Failed to debit wallet'});
    }
});

router.get('/:wallet_id/balance', getWalletBalance);

export default router;