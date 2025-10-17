-- Remove Duplicate Data from Sentio Database
-- Run this in Supabase SQL Editor to clean up duplicate records

-- ============================================
-- Step 1: Check for Duplicates
-- ============================================

-- Count duplicate clients
SELECT name, COUNT(*) as duplicate_count
FROM clients
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Count duplicate prospects
SELECT name, COUNT(*) as duplicate_count
FROM prospects
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================
-- Step 2: Remove Duplicate Clients
-- ============================================

-- Keep only the FIRST occurrence of each client (oldest created_at)
-- Delete all other duplicates
DELETE FROM clients a
USING clients b
WHERE a.id > b.id
  AND a.name = b.name
  AND a.advisor_id = b.advisor_id;

-- ============================================
-- Step 3: Remove Duplicate Prospects
-- ============================================

-- Keep only the FIRST occurrence of each prospect (oldest created_at)
-- Delete all other duplicates
DELETE FROM prospects a
USING prospects b
WHERE a.id > b.id
  AND a.name = b.name
  AND a.advisor_id = b.advisor_id;

-- ============================================
-- Step 4: Remove Duplicate News Alerts
-- ============================================

-- Keep only the FIRST occurrence of each news alert (same client + URL)
-- Delete all other duplicates
DELETE FROM news_alerts a
USING news_alerts b
WHERE a.id > b.id
  AND a.client_id = b.client_id
  AND a.url = b.url;

-- ============================================
-- Step 5: Remove Duplicate Interactions
-- ============================================

-- Keep only the FIRST occurrence of duplicate interactions
DELETE FROM interactions a
USING interactions b
WHERE a.id > b.id
  AND a.prospect_id = b.prospect_id
  AND a.interaction_type = b.interaction_type
  AND a.interaction_date = b.interaction_date
  AND a.notes = b.notes;

-- ============================================
-- Step 6: Verify Cleanup
-- ============================================

-- Check final counts
SELECT 'Clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'Prospects', COUNT(*) FROM prospects
UNION ALL
SELECT 'News Alerts', COUNT(*) FROM news_alerts
UNION ALL
SELECT 'Interactions', COUNT(*) FROM interactions;

-- Check that no duplicates remain
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
) duplicates;

-- ============================================
-- Expected Results After Cleanup:
-- - 5 unique clients
-- - 6 unique prospects
-- - No duplicate news alerts
-- - No duplicate interactions
-- ============================================
