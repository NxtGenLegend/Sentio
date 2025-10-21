-- ============================================
-- FIX ALERT_CONFIGS TABLE SCHEMA
-- ============================================
-- This script adds missing columns to the alert_configs table
-- Run this BEFORE running COMPLETE_SEED_DATA.sql
-- ============================================

-- Add missing columns if they don't exist
ALTER TABLE alert_configs
ADD COLUMN IF NOT EXISTS excluded_keywords TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'alert_configs'
ORDER BY ordinal_position;

-- ============================================
-- Expected columns after running this script:
-- - id
-- - client_id
-- - keywords (TEXT[])
-- - excluded_keywords (TEXT[]) -- NEWLY ADDED
-- - priority_threshold (TEXT)
-- - email_notifications (BOOLEAN)
-- - sms_notifications (BOOLEAN)
-- - categories_enabled (TEXT[])
-- - created_at
-- - updated_at
-- ============================================
