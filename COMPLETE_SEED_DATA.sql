-- ============================================
-- COMPLETE SEED DATA FOR ALL TABLES
-- ============================================
-- This script populates ALL tables with comprehensive sample data
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADD NEWS ALERTS FOR CLIENTS
-- ============================================

-- Get client IDs first (we'll use these in subsequent inserts)
DO $$
DECLARE
  richard_id UUID;
  margaret_id UUID;
  harrison_id UUID;
BEGIN
  -- Get client IDs
  SELECT id INTO richard_id FROM clients WHERE first_name = 'Richard' AND last_name = 'Ashford' LIMIT 1;
  SELECT id INTO margaret_id FROM clients WHERE first_name = 'Margaret' AND last_name = 'Whitmore' LIMIT 1;
  SELECT id INTO harrison_id FROM clients WHERE first_name = 'Harrison' AND last_name = 'Blackwell' LIMIT 1;

  -- Insert news alerts for Richard Ashford
  INSERT INTO news_alerts (client_id, title, summary, url, source, published_at, priority, category, is_read)
  VALUES
    (richard_id, 'Commercial Real Estate Market Shows Strong Q4 Performance', 'Manhattan commercial properties see 15% value increase, benefiting portfolio holders with significant real estate exposure.', 'https://example.com/news/1', 'Wall Street Journal', NOW() - INTERVAL '2 days', 'high', 'market', false),
    (richard_id, 'New Tax Regulations for Real Estate Trusts', 'Recent changes to trust taxation could impact real estate holdings over $10M. Review recommended.', 'https://example.com/news/2', 'Bloomberg Tax', NOW() - INTERVAL '5 days', 'high', 'regulatory', false),
    (richard_id, 'NYC Property Values Surge in Upper East Side', 'Properties in the 10021 zip code show 8% appreciation, directly relevant to Park Avenue holdings.', 'https://example.com/news/3', 'Real Estate Weekly', NOW() - INTERVAL '1 week', 'medium', 'market', true);

  -- Insert news alerts for Margaret Whitmore
  INSERT INTO news_alerts (client_id, title, summary, url, source, published_at, priority, category, is_read)
  VALUES
    (margaret_id, 'ESG Funds Outperform Traditional Portfolios in 2024', 'Sustainable investment strategies show 12% higher returns than conventional approaches, validating ESG strategy.', 'https://example.com/news/4', 'Financial Times', NOW() - INTERVAL '1 day', 'high', 'market', false),
    (margaret_id, 'New SEC Rules on ESG Investment Disclosure', 'Enhanced transparency requirements for ESG funds take effect Q2 2025. Portfolio review recommended.', 'https://example.com/news/5', 'SEC.gov', NOW() - INTERVAL '3 days', 'high', 'regulatory', false),
    (margaret_id, 'Impact Investing Conference Announces 2025 Dates', 'Annual impact investing summit scheduled for June in San Francisco. Early bird registration now open.', 'https://example.com/news/6', 'Impact Investor', NOW() - INTERVAL '1 week', 'low', 'general', false),
    (margaret_id, 'Solar Energy Stocks Rally on New Legislation', 'Renewable energy holdings up 18% following passage of clean energy bill.', 'https://example.com/news/7', 'CNBC', NOW() - INTERVAL '2 weeks', 'medium', 'market', true);

  -- Insert news alerts for Harrison Blackwell
  INSERT INTO news_alerts (client_id, title, summary, url, source, published_at, priority, category, is_read)
  VALUES
    (harrison_id, 'Tech Sector Volatility: VC Portfolio Impact Analysis', 'Early-stage tech companies face valuation pressures. Portfolio diversification strategies recommended.', 'https://example.com/news/8', 'TechCrunch', NOW() - INTERVAL '1 day', 'high', 'market', false),
    (harrison_id, 'AI Startup Valuations Reach Record Highs', 'Artificial intelligence sector shows 25% growth, benefiting venture capital positions.', 'https://example.com/news/9', 'VentureBeat', NOW() - INTERVAL '4 days', 'medium', 'market', false),
    (harrison_id, 'New Accredited Investor Rules Proposed', 'SEC considers changes to accredited investor definitions affecting private placements.', 'https://example.com/news/10', 'Bloomberg Law', NOW() - INTERVAL '1 week', 'high', 'regulatory', true);

END $$;

-- ============================================
-- 2. ADD ALERT CONFIGURATIONS FOR CLIENTS
-- ============================================

INSERT INTO alert_configs (client_id, keywords, excluded_keywords, priority_threshold, email_notifications, categories_enabled)
SELECT
  id,
  CASE
    WHEN first_name = 'Richard' THEN ARRAY['real estate', 'commercial property', 'trust', 'Park Avenue', 'Manhattan']
    WHEN first_name = 'Margaret' THEN ARRAY['ESG', 'sustainable investing', 'impact funds', 'clean energy', 'social responsibility']
    WHEN first_name = 'Harrison' THEN ARRAY['venture capital', 'tech', 'startup', 'AI', 'private equity']
    ELSE ARRAY['investment', 'market', 'portfolio']
  END,
  ARRAY['spam', 'advertisement', 'promotional'],
  'medium',
  true,
  ARRAY['market', 'regulatory', 'general']
FROM clients
WHERE first_name IN ('Richard', 'Margaret', 'Harrison')
ON CONFLICT (client_id) DO UPDATE
SET
  keywords = EXCLUDED.keywords,
  excluded_keywords = EXCLUDED.excluded_keywords,
  updated_at = NOW();

-- ============================================
-- 3. ADD INTERACTIONS FOR PROSPECTS
-- ============================================

-- Add interactions to existing prospects
INSERT INTO interactions (prospect_id, interaction_type, subject, notes, interaction_date, outcome)
SELECT
  id,
  'call',
  'Initial Discovery Call',
  'Discussed investment goals and current portfolio. Strong interest in diversification strategies. Follow-up scheduled for next week.',
  NOW() - INTERVAL '5 days',
  'scheduled_followup'
FROM prospects
LIMIT 1;

INSERT INTO interactions (prospect_id, interaction_type, subject, notes, interaction_date, outcome)
SELECT
  id,
  'email',
  'Portfolio Analysis Report Sent',
  'Sent comprehensive analysis of current holdings with recommendations for optimization. Awaiting feedback.',
  NOW() - INTERVAL '3 days',
  'pending'
FROM prospects
OFFSET 1
LIMIT 1;

INSERT INTO interactions (prospect_id, interaction_type, subject, notes, interaction_date, outcome)
SELECT
  id,
  'meeting',
  'In-Person Consultation',
  'Met at office to review investment strategy. Discussed tax-advantaged options and estate planning. Very positive meeting, moving forward with proposal.',
  NOW() - INTERVAL '1 week',
  'qualified'
FROM prospects
OFFSET 2
LIMIT 1;

INSERT INTO interactions (prospect_id, interaction_type, subject, notes, interaction_date, outcome)
SELECT
  id,
  'call',
  'Follow-up Discussion',
  'Answered questions about fee structure and service offerings. Prospect requested references from similar clients.',
  NOW() - INTERVAL '2 weeks',
  'scheduled_followup'
FROM prospects
OFFSET 3
LIMIT 1;

-- ============================================
-- 4. UPDATE PROSPECTS WITH DETAILED INFO
-- ============================================

-- Update first prospect
UPDATE prospects
SET
  middle_name = 'Elizabeth',
  date_of_birth = '1985-06-15',
  place_of_birth = 'Boston, MA',
  primary_email = COALESCE(email, 'prospect1@example.com'),
  mobile_phone = '(617) 555-0234',
  work_phone = '(617) 555-8900',
  preferred_phone = 'mobile',
  legal_street = '100 Beacon Street, Apt 5B',
  legal_city = 'Boston',
  legal_state = 'MA',
  legal_zip = '02108',
  us_citizen = true,
  employment_status = 'employed',
  employer_name = 'Tech Innovations Inc',
  occupation = 'Chief Technology Officer',
  education_level = 'Master',
  estimated_aum = 2500000,
  notes = COALESCE(notes || E'\n\n', '') || 'Updated: Referred by existing client. Interested in ESG investing and impact funds. Recently sold startup for $5M. Looking for comprehensive wealth management.'
WHERE id = (SELECT id FROM prospects ORDER BY created_at LIMIT 1 OFFSET 0);

-- Update second prospect
UPDATE prospects
SET
  middle_name = 'Wei',
  date_of_birth = '1978-03-22',
  place_of_birth = 'San Francisco, CA',
  primary_email = COALESCE(email, 'prospect2@example.com'),
  mobile_phone = '(415) 555-0567',
  secondary_email = 'personal@example.com',
  legal_street = '555 California Street, Suite 2800',
  legal_city = 'San Francisco',
  legal_state = 'CA',
  legal_zip = '94104',
  mailing_street = 'PO Box 12345',
  mailing_city = 'San Francisco',
  mailing_state = 'CA',
  mailing_zip = '94104',
  us_citizen = false,
  country_of_citizenship = 'Taiwan',
  country_of_tax_residence = 'United States',
  residency_status = 'permanent',
  employment_status = 'employed',
  employer_name = 'Chen Capital Management',
  occupation = 'Founder & Managing Partner',
  education_level = 'MBA',
  estimated_aum = 15000000,
  notes = COALESCE(notes || E'\n\n', '') || 'Updated: High net worth individual. Former Goldman Sachs VP. Founded own hedge fund. Interested in alternative investments and cryptocurrency exposure.'
WHERE id = (SELECT id FROM prospects ORDER BY created_at LIMIT 1 OFFSET 1);

-- Update third prospect
UPDATE prospects
SET
  middle_name = 'Marie',
  date_of_birth = '1990-11-08',
  place_of_birth = 'Miami, FL',
  primary_email = COALESCE(email, 'prospect3@example.com'),
  mobile_phone = '(305) 555-0789',
  home_phone = '(305) 555-0123',
  preferred_phone = 'mobile',
  legal_street = '1 Brickell Avenue, Apt 4501',
  legal_city = 'Miami',
  legal_state = 'FL',
  legal_zip = '33131',
  us_citizen = true,
  employment_status = 'employed',
  employer_name = 'Martinez Real Estate Group',
  business_street = '100 SE 2nd Street, Floor 35',
  business_city = 'Miami',
  business_state = 'FL',
  business_zip = '33131',
  tenure_years = 8,
  occupation = 'Real Estate Developer',
  education_level = 'Bachelor',
  estimated_aum = 8500000,
  notes = COALESCE(notes || E'\n\n', '') || 'Updated: Third-generation real estate developer. Large portfolio of commercial properties in Miami. Interested in diversifying beyond real estate into equities and bonds.'
WHERE id = (SELECT id FROM prospects ORDER BY created_at LIMIT 1 OFFSET 2);

-- Update fourth prospect (if exists)
UPDATE prospects
SET
  date_of_birth = '1955-04-12',
  place_of_birth = 'Chicago, IL',
  primary_email = COALESCE(email, 'prospect4@example.com'),
  mobile_phone = COALESCE(phone, '(312) 555-0456'),
  legal_street = '875 North Michigan Avenue',
  legal_city = 'Chicago',
  legal_state = 'IL',
  legal_zip = '60611',
  us_citizen = true,
  employment_status = 'retired',
  occupation = 'Former CEO (Retired)',
  education_level = 'MBA',
  estimated_aum = 22000000,
  notes = COALESCE(notes || E'\n\n', '') || 'Updated: Recently retired from Fortune 500 company. Received large severance package and stock options. Looking for conservative wealth preservation strategy.'
WHERE id = (SELECT id FROM prospects ORDER BY created_at LIMIT 1 OFFSET 3);

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Show all news alerts
SELECT
  na.id,
  c.first_name || ' ' || c.last_name as client_name,
  na.title,
  na.priority,
  na.category,
  na.is_read,
  na.published_at
FROM news_alerts na
JOIN clients c ON na.client_id = c.id
ORDER BY na.published_at DESC;

-- Show alert configurations
SELECT
  ac.id,
  c.first_name || ' ' || c.last_name as client_name,
  ac.keywords,
  ac.priority_threshold,
  ac.email_notifications,
  ac.categories_enabled
FROM alert_configs ac
JOIN clients c ON ac.client_id = c.id;

-- Show prospect interactions
SELECT
  i.id,
  p.name as prospect_name,
  i.interaction_type,
  i.subject,
  i.outcome,
  i.interaction_date
FROM interactions i
JOIN prospects p ON i.prospect_id = p.id
ORDER BY i.interaction_date DESC;

-- Show updated prospect details
SELECT
  id,
  name,
  status,
  estimated_aum,
  employment_status,
  occupation,
  legal_city || ', ' || legal_state as location,
  CASE WHEN date_of_birth IS NOT NULL THEN 'Yes' ELSE 'No' END as has_personal_info,
  CASE WHEN legal_street IS NOT NULL THEN 'Yes' ELSE 'No' END as has_address
FROM prospects
ORDER BY estimated_aum DESC NULLS LAST;

-- Summary counts
SELECT
  'News Alerts' as table_name,
  COUNT(*) as record_count
FROM news_alerts
UNION ALL
SELECT
  'Alert Configs' as table_name,
  COUNT(*) as record_count
FROM alert_configs
UNION ALL
SELECT
  'Interactions' as table_name,
  COUNT(*) as record_count
FROM interactions
UNION ALL
SELECT
  'Holdings' as table_name,
  COUNT(*) as record_count
FROM holdings
UNION ALL
SELECT
  'Portfolio Allocations' as table_name,
  COUNT(*) as record_count
FROM portfolio_allocations
UNION ALL
SELECT
  'Client Accounts' as table_name,
  COUNT(*) as record_count
FROM client_accounts;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- ✅ 10+ news alerts across all clients
-- ✅ Alert configs for Richard, Margaret, and Harrison
-- ✅ 4+ interactions for prospects
-- ✅ Updated prospect information with comprehensive KYC data
-- ✅ Holdings, portfolio_allocations, and client_accounts from previous script
-- ============================================
