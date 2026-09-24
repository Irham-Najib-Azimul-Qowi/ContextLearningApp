-- ==============================================================================
-- PAHAMI V2 — Admin Control Center, Multi-Provider AI & Remote System Maintenance
-- Migration: 20260924020000_admin_control_center.sql
-- ==============================================================================

-- 1. Admin Accounts Table (Username + Salted Hash Authentication)
CREATE TABLE IF NOT EXISTS admin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'SYSTEM_ADMIN', -- SUPER_ADMIN, SYSTEM_ADMIN, CONTENT_ADMIN
    is_active BOOLEAN NOT NULL DEFAULT true,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_accounts(id) ON DELETE CASCADE,
    session_token_hash TEXT UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Encrypted AI Credentials Table (AES-256-GCM Ciphertext)
CREATE TABLE IF NOT EXISTS ai_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    provider VARCHAR(32) NOT NULL DEFAULT 'gemini',
    quota_group VARCHAR(64) NOT NULL DEFAULT 'default_project',
    encrypted_api_key TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    masked_key VARCHAR(32) NOT NULL,
    priority INT NOT NULL DEFAULT 1,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    health_status VARCHAR(32) NOT NULL DEFAULT 'healthy', -- healthy, degraded, rate_limited, invalid, disabled
    consecutive_errors INT NOT NULL DEFAULT 0,
    circuit_state VARCHAR(16) NOT NULL DEFAULT 'CLOSED', -- CLOSED, OPEN, HALF_OPEN
    circuit_opened_at TIMESTAMPTZ,
    cooldown_seconds INT NOT NULL DEFAULT 60,
    daily_request_limit INT NOT NULL DEFAULT 1500,
    last_used_at TIMESTAMPTZ,
    last_error TEXT,
    last_error_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AI Feature Model Configurations Table
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key VARCHAR(64) UNIQUE NOT NULL, -- question_generation, question_scan, material_generation, contextual_rewriting, educational_validation
    provider VARCHAR(32) NOT NULL DEFAULT 'gemini',
    primary_model VARCHAR(64) NOT NULL DEFAULT 'gemini-2.5-flash',
    fallback_model VARCHAR(64) NOT NULL DEFAULT 'gemini-1.5-flash',
    required_capabilities TEXT[] NOT NULL DEFAULT ARRAY['text_generation'],
    timeout_ms INT NOT NULL DEFAULT 25000,
    temperature NUMERIC(3,2) NOT NULL DEFAULT 0.20,
    max_output_tokens INT NOT NULL DEFAULT 2048,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. AI Usage Events Log Table
CREATE TABLE IF NOT EXISTS ai_usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID REFERENCES ai_credentials(id) ON DELETE SET NULL,
    credential_name VARCHAR(128),
    quota_group VARCHAR(64),
    feature_key VARCHAR(64) NOT NULL,
    model VARCHAR(64) NOT NULL,
    input_tokens INT NOT NULL DEFAULT 0,
    output_tokens INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL, -- SUCCESS, RATE_LIMITED, QUOTA_EXCEEDED, ERROR, FAILED_OVER
    error_type VARCHAR(64),
    error_message TEXT,
    caller_user_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. AI Failover Events Table
CREATE TABLE IF NOT EXISTS ai_failover_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_credential_id UUID REFERENCES ai_credentials(id) ON DELETE SET NULL,
    target_credential_id UUID REFERENCES ai_credentials(id) ON DELETE SET NULL,
    feature_key VARCHAR(64) NOT NULL,
    error_classification VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Admin Structured Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_accounts(id) ON DELETE SET NULL,
    admin_username VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL, -- ADMIN_LOGIN, LOGOUT, CREDENTIAL_CREATE, CREDENTIAL_TOGGLE, MODEL_UPDATE, USER_STATUS_CHANGE, etc.
    target_type VARCHAR(64) NOT NULL, -- USER, SCHOOL, CREDENTIAL, MODEL, KNOWLEDGE_ENTITY, SETTING
    target_id VARCHAR(64),
    result VARCHAR(32) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILED, BLOCKED
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. System Settings Table (Dynamic Feature Flags & Maintenance Mode)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by VARCHAR(64),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. System Internal Notifications Table
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(32) NOT NULL DEFAULT 'INFO', -- INFO, WARNING, ALERT
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for Fast Querying
CREATE INDEX IF NOT EXISTS idx_admin_accounts_username ON admin_accounts(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_ai_credentials_quota_group ON ai_credentials(quota_group);
CREATE INDEX IF NOT EXISTS idx_ai_usage_events_created ON ai_usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);

-- Seed Default System Settings
INSERT INTO system_settings (key, value, description, updated_by)
VALUES
    ('maintenance_mode', '{"enabled": false, "message": "Sistem sedang dalam pemeliharaan berkala untuk peningkatan performa AI.", "allow_admin": true}'::jsonb, 'Status Maintenance Mode Platform', 'SYSTEM'),
    ('ai_global_switch', '{"enabled": true, "fallback_to_simulation": true, "max_daily_budget_usd": 10.0}'::jsonb, 'Global Switch untuk Pemanggilan AI Gemini', 'SYSTEM'),
    ('supported_regions', '["35.77", "35.19", "35.21", "35.20", "35.02", "35.01", "33.74"]'::jsonb, 'Daftar ID Wilayah Prioritas Karesidenan Madiun & Semarang', 'SYSTEM')
ON CONFLICT (key) DO NOTHING;

-- Seed Default Feature Model Configurations
INSERT INTO ai_models (feature_key, provider, primary_model, fallback_model, required_capabilities, timeout_ms, temperature, max_output_tokens)
VALUES
    ('question_generation', 'gemini', 'gemini-2.5-flash', 'gemini-1.5-flash', ARRAY['text_generation', 'structured_output'], 25000, 0.20, 2048),
    ('question_scan', 'gemini', 'gemini-2.5-flash', 'gemini-1.5-flash', ARRAY['text_generation', 'image_understanding'], 30000, 0.10, 2048),
    ('material_generation', 'gemini', 'gemini-2.5-flash', 'gemini-1.5-flash', ARRAY['text_generation'], 30000, 0.25, 3072),
    ('contextual_rewriting', 'gemini', 'gemini-2.5-flash', 'gemini-1.5-flash', ARRAY['text_generation', 'structured_output'], 25000, 0.20, 2048),
    ('educational_validation', 'gemini', 'gemini-2.5-flash', 'gemini-1.5-flash', ARRAY['text_generation', 'structured_output'], 20000, 0.10, 1024)
ON CONFLICT (feature_key) DO NOTHING;
