CREATE TABLE IF NOT EXISTS ledger_entries(
    ledger_entry_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    wallet_id            UUID REFERENCES wallets(wallet_id),

    transaction_id      UUID NOT NULL REFERENCES transactions(transaction_id),
    
    entry_type          TEXT NOT NULL CHECK (entry_type IN ('debit', 'credit')),

    amount              BIGINT NOT NULL CHECK (amount > 0),

    account             TEXT NOT NULL,

    balance_after      BIGINT NOT NULL CHECK (balance_after >= 0),
    balance_before     BIGINT NOT NULL CHECK (balance_before >= 0),

    notes               TEXT,
    narration           TEXT,
    effective_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reversed_at        UUID REFERENCES ledger_entries(ledger_entry_id) -- points to the entry that reversed this one
)
CREATE INDEX idx_ledger_entries_wallet_id ON ledger_entries(wallet_id);
CREATE INDEX idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_entries_account ON ledger_entries(account);
CREATE INDEX idx_ledger_entries_created_at ON ledger_entries(created_at);