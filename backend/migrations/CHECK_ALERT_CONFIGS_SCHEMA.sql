-- ============================================
-- CHECK ALERT_CONFIGS TABLE SCHEMA
-- ============================================
-- Run this to see what columns actually exist
-- ============================================

-- Show all columns in alert_configs table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'alert_configs'
ORDER BY ordinal_position;

-- Show sample data if any exists
SELECT * FROM alert_configs LIMIT 5;
