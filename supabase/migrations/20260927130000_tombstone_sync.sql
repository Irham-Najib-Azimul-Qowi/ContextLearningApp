-- ==============================================================================
-- PAHAMI V2 / DEPASKAN — TOMBSTONE SYNC FOR PERSISTENT DELETION
-- Migration: 20260927130000_tombstone_sync.sql
-- ==============================================================================

ALTER TABLE public.user_synced_data 
ADD COLUMN IF NOT EXISTS deleted_ids JSONB DEFAULT '{"materials":[],"questions":[],"rooms":[]}'::jsonb;
