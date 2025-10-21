-- ============================================
-- FIX ALL SCHEMA ISSUES
-- ============================================
-- This script fixes ALL schema mismatches between
-- the database and the seed data script
-- Run this BEFORE running COMPLETE_SEED_DATA.sql
-- ============================================

-- ============================================
-- 1. FIX ALERT_CONFIGS TABLE
-- ============================================

-- Add missing columns
ALTER TABLE alert_configs
ADD COLUMN IF NOT EXISTS excluded_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS priority_threshold TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
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

-- ============================================
-- 2. FIX INTERACTIONS TABLE
-- ============================================

-- Add missing outcome column
ALTER TABLE interactions
ADD COLUMN IF NOT EXISTS outcome TEXT;

-- Add missing advisor_id column if it doesn't exist
ALTER TABLE interactions
ADD COLUMN IF NOT EXISTS advisor_id UUID;

-- ============================================
-- 3. VERIFY ALL TABLES HAVE NECESSARY COLUMNS
-- ============================================

-- Check alert_configs
SELECT 'alert_configs columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alert_configs'
ORDER BY ordinal_position;

-- Check interactions
SELECT 'interactions columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'interactions'
ORDER BY ordinal_position;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
--
-- alert_configs should have:
-- - id
-- - client_id
-- - keywords
-- - excluded_keywords (NEW)
-- - priority_threshold (renamed from min_priority)
-- - email_notifications (NEW)
-- - categories_enabled (renamed from categories)
-- - created_at
-- - updated_at
--
-- interactions should have:
-- - id
-- - advisor_id
-- - prospect_id
-- - client_id
-- - interaction_type
-- - subject
-- - notes
-- - interaction_date
-- - outcome (NEW)
-- - created_at
-- ============================================
