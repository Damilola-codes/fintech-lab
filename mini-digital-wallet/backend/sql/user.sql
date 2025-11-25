CREATE TABLE IF NOT EXISTS users (
    user_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username           VARCHAR(50) UNIQUE NOT NULL,
    full_name         VARCHAR(100) NOT NULL,
    email              TEXT UNIQUE NOT NULL,
    phone_number      VARCHAR(15) UNIQUE NOT NULL,
    password_hash     TEXT NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number);