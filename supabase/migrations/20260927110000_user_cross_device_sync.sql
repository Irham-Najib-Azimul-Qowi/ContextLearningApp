-- ==============================================================================
-- PAHAMI V2 — CROSS-DEVICE USER SYNC DATA
-- Migration: 20260927110000_user_cross_device_sync.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_synced_data (
    user_id TEXT PRIMARY KEY,
    user_email TEXT,
    profile JSONB,
    materials JSONB DEFAULT '[]'::jsonb,
    questions JSONB DEFAULT '[]'::jsonb,
    rooms JSONB DEFAULT '[]'::jsonb,
    schools JSONB DEFAULT '[]'::jsonb,
    active_school_id TEXT,
    onboarding_completed BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_synced_data_email ON public.user_synced_data(user_email);

-- Enable RLS and strict security policy for authenticated clients & service_role
ALTER TABLE public.user_synced_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access user_synced_data" ON public.user_synced_data;
DROP POLICY IF EXISTS "User synced data access own" ON public.user_synced_data;
DROP POLICY IF EXISTS "Service role full access user_synced_data" ON public.user_synced_data;

CREATE POLICY "User synced data access own"
    ON public.user_synced_data
    FOR ALL
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Service role full access user_synced_data"
    ON public.user_synced_data
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

