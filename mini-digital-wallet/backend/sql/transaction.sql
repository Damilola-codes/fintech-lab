CREATE TABLE IF NOT EXISTS transactions(
    -- require extension (run once)
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE transactions (
        transaction_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        idempotency_key       TEXT, -- allow NULL, enforce per-user uniqueness with index below
        user_id               UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
        sender_wallet_id      UUID REFERENCES wallets(wallet_id),
        receiver_wallet_id    UUID REFERENCES wallets(wallet_id),
        channel               TEXT NOT NULL CHECK (channel IN ('internal','bank','card','ussd','processor')),

        amount                BIGINT NOT NULL CHECK (amount > 0), -- store in minor units

        currency              TEXT NOT NULL DEFAULT 'NGN', -- ISO 4217 code

        transaction_type      TEXT NOT NULL CHECK (transaction_type IN ('credit','debit')),

        purpose               TEXT NOT NULL CHECK (purpose IN ('wallet_transfer','funding','airtime','purchase','withdrawal','fee','settlement','chargeback','reversal')),

        fee                   BIGINT NOT NULL DEFAULT 0 CHECK (fee >= 0),

        settlement_reference  TEXT,
        accounting_category   TEXT,
        failure_code          TEXT,
        meta_data             JSONB,

        attempted_at          TIMESTAMPTZ,
        completed_at          TIMESTAMPTZ,

        notes                 TEXT,

        status                TEXT NOT NULL CHECK (status IN ('initiated','pending','success','failed','reversed','cancelled')),

        reference             TEXT NOT NULL,

        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Per-user idempotency (allow multiple NULLs)
    CREATE UNIQUE INDEX idx_transactions_idempotency_key_user
        ON transactions(idempotency_key, user_id)
        WHERE idempotency_key IS NOT NULL;

    -- Useful indexes (avoid duplicates with UNIQUE constraints)
    CREATE INDEX idx_transactions_user_created_at ON transactions(user_id, created_at);
    CREATE INDEX idx_transactions_status_created_at ON transactions(status, created_at);
    CREATE INDEX idx_transactions_wallets ON transactions(sender_wallet_id, receiver_wallet_id);
    CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);

    -- trigger to auto-update updated_at (simple example)
    CREATE OR REPLACE FUNCTION trg_set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at();