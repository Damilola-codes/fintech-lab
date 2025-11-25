CREATE TABLE IF NOT EXISTS wallets(
    wallet_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ledger_balance   BIGINT NOT NULL DEFAULT 0,
    available_balance BIGINT NOT NULL DEFAULT 0,
    locked_balance  BIGINT NOT NULL DEFAULT 0,
    currency         VARCHAR(3) NOT NULL DEFAULT 'NGN',
    status           TEXT NOT NULL DEFAULT 'active',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_status ON wallets(status);
CREATE INDEX idx_wallets_currency ON wallets(currency);
