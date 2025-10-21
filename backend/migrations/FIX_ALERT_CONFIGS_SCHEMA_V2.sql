-- ============================================
-- FIX ALERT_CONFIGS TABLE SCHEMA V2
-- ============================================
-- This script adds missing columns to match the UI expectations
-- Run this BEFORE running COMPLETE_SEED_DATA_V2.sql
-- ============================================

-- Add missing columns if they don't exist
ALTER TABLE alert_configs
ADD COLUMN IF NOT EXISTS excluded_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS priority_threshold TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS categories_enabled TEXT[] DEFAULT ARRAY['market', 'regulatory', 'general']::TEXT[];

-- Rename columns to match UI expectations (if they exist with old names)
DO $$
BEGIN
    -- Only rename if categories exists and categories_enabled doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'alert_configs' AND column_name = 'categories'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'alert_configs' AND column_name = 'categories_enabled'
    ) THEN
        ALTER TABLE alert_configs RENAME COLUMN categories TO categories_enabled;
    END IF;

    -- Only rename if min_priority exists and priority_threshold doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'alert_configs' AND column_name = 'min_priority'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'alert_configs' AND column_name = 'priority_threshold'
    ) THEN
        ALTER TABLE alert_configs RENAME COLUMN min_priority TO priority_threshold;
    END IF;
END $$;

-- Add unique constraint on client_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'alert_configs_client_id_key'
    ) THEN
        ALTER TABLE alert_configs ADD CONSTRAINT alert_configs_client_id_key UNIQUE (client_id);
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'alert_configs'
ORDER BY ordinal_position;

-- ============================================
-- Expected columns after running this script:
-- - id (UUID)
-- - client_id (UUID)
-- - keywords (TEXT[])
-- - excluded_keywords (TEXT[]) -- NEWLY ADDED
-- - priority_threshold (TEXT) -- RENAMED from min_priority
-- - email_notifications (BOOLEAN) -- NEWLY ADDED
-- - sms_notifications (BOOLEAN) -- NEWLY ADDED
-- - categories_enabled (TEXT[]) -- RENAMED from categories
-- - created_at (TIMESTAMPTZ)
-- - updated_at (TIMESTAMPTZ)
-- ============================================
