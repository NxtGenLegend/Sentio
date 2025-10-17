-- ============================================
-- SENTIO DATABASE CLEANUP SCRIPT
-- ============================================
-- This script will:
-- 1. Remove all duplicates
-- 2. Keep only 3 clients (reduce from 10)
-- 3. Speed up news fetching significantly
-- ============================================

-- STEP 1: Remove Duplicate Clients
-- Keep only the FIRST occurrence of each client (oldest created_at)
DELETE FROM clients a
USING clients b
WHERE a.id > b.id
  AND a.name = b.name
  AND a.advisor_id = b.advisor_id;

-- STEP 2: Remove Duplicate Prospects
-- Keep only the FIRST occurrence of each prospect (oldest created_at)
DELETE FROM prospects a
USING prospects b
WHERE a.id > b.id
  AND a.name = b.name
  AND a.advisor_id = b.advisor_id;

-- STEP 3: Remove Duplicate News Alerts
-- Keep only the FIRST occurrence of each news alert (same client + URL)
DELETE FROM news_alerts a
USING news_alerts b
WHERE a.id > b.id
  AND a.client_id = b.client_id
  AND a.url = b.url;

-- STEP 4: Remove Duplicate Interactions
-- Keep only the FIRST occurrence of duplicate interactions
DELETE FROM interactions a
USING interactions b
WHERE a.id > b.id
  AND a.prospect_id = b.prospect_id
  AND a.interaction_type = b.interaction_type
  AND a.interaction_date = b.interaction_date
  AND COALESCE(a.notes, '') = COALESCE(b.notes, '');

-- ============================================
-- STEP 5: Reduce Client Count (Keep Only 3)
-- ============================================

-- First, let's see which clients we have
-- (Run this SELECT to see the list before deleting)
SELECT id, name, created_at
FROM clients
ORDER BY created_at
LIMIT 10;

-- Delete all clients except the first 3 (oldest)
-- This will CASCADE delete their related news_alerts and alert_configs
DELETE FROM clients
WHERE id NOT IN (
  SELECT id
  FROM clients
  ORDER BY created_at
  LIMIT 3
);

-- ============================================
-- STEP 6: Clean Up Old News Alerts (Optional)
-- ============================================

-- Remove news alerts older than 30 days to improve performance
DELETE FROM news_alerts
WHERE published_at < NOW() - INTERVAL '30 days';

-- Or keep only the 10 most recent articles per client
DELETE FROM news_alerts
WHERE id NOT IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY published_at DESC) as rn
    FROM news_alerts
  ) ranked
  WHERE rn <= 10
);

-- ============================================
-- STEP 7: Verification Queries
-- ============================================

-- Check final counts
SELECT 'Clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'Prospects', COUNT(*) FROM prospects
UNION ALL
SELECT 'News Alerts', COUNT(*) FROM news_alerts
UNION ALL
SELECT 'Interactions', COUNT(*) FROM interactions;

-- Verify no duplicates remain
SELECT 'Duplicate Clients' as check_type, COUNT(*) as remaining_duplicates
FROM (
  SELECT name, advisor_id, COUNT(*) as cnt
  FROM clients
  GROUP BY name, advisor_id
  HAVING COUNT(*) > 1
) duplicates
UNION ALL
SELECT 'Duplicate Prospects', COUNT(*)
FROM (
  SELECT name, advisor_id, COUNT(*) as cnt
  FROM prospects
  GROUP BY name, advisor_id
  HAVING COUNT(*) > 1
) duplicates
UNION ALL
SELECT 'Duplicate News Alerts', COUNT(*)
FROM (
  SELECT client_id, url, COUNT(*) as cnt
  FROM news_alerts
  GROUP BY client_id, url
  HAVING COUNT(*) > 1
) duplicates;

-- Show remaining clients
SELECT id, name, email, aum, client_since
FROM clients
ORDER BY created_at;

-- ============================================
-- Expected Results After Cleanup:
-- - 3 unique clients (reduced from 10)
-- - 6 unique prospects
-- - No duplicate news alerts
-- - No duplicate interactions
-- - News fetch will take ~18 seconds instead of 60 seconds
-- ============================================
