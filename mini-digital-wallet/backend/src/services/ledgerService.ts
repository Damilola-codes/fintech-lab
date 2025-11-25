class LedgerService {
    async write(
        {transactionId, walletId, entryType, amount, balanceBefore, balanceAfter}: any, client?: any
    )
    {
        await (client.query('INSERT INTO ledger_entries (transaction_id, wallet_id, entry_type, amount, balance_before, balance_after, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
            [transactionId, walletId, entryType, amount, balanceBefore, balanceAfter]));
    }
}

export default new LedgerService();