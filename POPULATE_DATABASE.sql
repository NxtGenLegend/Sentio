-- Quick Start SQL Script for Sentio
-- Copy and paste this entire script into your Supabase SQL Editor and run it
-- This will create a test advisor and populate your database with sample data

-- ============================================
-- Step 1: Create Test Advisor
-- ============================================

INSERT INTO advisors (id, name, email, firm, phone)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Using a fixed UUID for easy reference
  'Penelope Whitmore',
  'p.whitmore@sentio.com',
  'Sentio Wealth Management',
  '+1 (212) 555-0123'
)
ON CONFLICT (id) DO NOTHING;  -- Skip if already exists

-- ============================================
-- Step 2: Insert Sample Clients
-- ============================================

INSERT INTO clients (advisor_id, name, email, phone, aum, client_since, account_type, profile, status) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Richard & Margaret Ashford',
  'r.ashford@ashfordholdings.com',
  '+1 (212) 555-0234',
  42500000,
  '2019-01-15',
  'joint',
  '{
    "holdings": ["Real Estate", "Manhattan Properties", "Upper East Side"],
    "interests": ["Real Estate Investment", "Luxury Properties"],
    "riskTolerance": "moderate",
    "investmentStyle": "value",
    "tags": ["Real Estate", "Manhattan", "High Net Worth"]
  }'::jsonb,
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'The Whitmore Family Trust',
  'trust@whitmorefoundation.org',
  '+1 (212) 555-0345',
  78200000,
  '2015-06-01',
  'trust',
  '{
    "holdings": ["ESG Funds", "Private Equity", "Sustainable Investments"],
    "interests": ["ESG Investing", "Impact Funds", "Private Equity"],
    "riskTolerance": "moderate-conservative",
    "investmentStyle": "ESG",
    "tags": ["ESG", "Sustainable Investing", "Private Equity", "Family Trust"]
  }'::jsonb,
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Harrison Blackwell',
  'harrison@blackwell.io',
  '+1 (415) 555-0456',
  31800000,
  '2021-03-10',
  'individual',
  '{
    "holdings": ["Tech Stocks", "NASDAQ", "Growth Equities"],
    "interests": ["Technology Sector", "AI", "Cloud Computing"],
    "riskTolerance": "aggressive",
    "investmentStyle": "growth",
    "tags": ["Technology", "NASDAQ", "Growth Investing"]
  }'::jsonb,
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Eleanor Cunningham',
  'eleanor@cunninghamarts.com',
  '+1 (212) 555-0567',
  19500000,
  '2020-07-22',
  'individual',
  '{
    "holdings": ["Art Collection", "Alternative Assets"],
    "interests": ["Contemporary Art", "Art Market", "Alternative Investments"],
    "riskTolerance": "moderate",
    "investmentStyle": "alternative",
    "tags": ["Art", "Alternative Assets", "Contemporary Art"]
  }'::jsonb,
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'The Kensington Foundation',
  'board@kensingtonfoundation.org',
  '+1 (212) 555-0678',
  125000000,
  '2012-09-01',
  'foundation',
  '{
    "holdings": ["ESG Funds", "Impact Investments", "Sustainable Portfolio"],
    "interests": ["ESG", "Philanthropy", "Sustainable Investing", "Impact"],
    "riskTolerance": "conservative",
    "investmentStyle": "ESG",
    "tags": ["ESG", "Foundation", "Impact Investing", "Philanthropy"]
  }'::jsonb,
  'active'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Step 3: Insert Sample Prospects
-- ============================================

INSERT INTO prospects (advisor_id, name, email, phone, company, status, tags, notes, estimated_aum, first_contact_date) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Alexandra Pemberton',
  'alex@pembertonholdings.com',
  '+1 (212) 555-0789',
  'Pemberton Holdings',
  'new',
  ARRAY['Family Office', 'Real Estate'],
  'Third-generation wealth. Interested in sustainable investing and impact portfolios. Currently holds $45M in real estate across Manhattan and the Hamptons. Looking to diversify into private equity.',
  45000000,
  '2024-10-05'
),
(
  '00000000-0000-0000-0000-000000000001',
  'James Hartford III',
  'james@hartfordcap.com',
  '+1 (650) 555-0890',
  'Hartford Capital',
  'contacted',
  ARRAY['Tech Founder', 'Exit Planning'],
  'Recently sold his fintech startup for $120M. Age 42, married with three children. Primary concerns: tax optimization, estate planning, and maintaining lifestyle post-exit.',
  120000000,
  '2024-10-01'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Victoria Ashford',
  'victoria.ashford@gmail.com',
  '+1 (212) 555-0901',
  'Independent',
  'contacted',
  ARRAY['Divorcee', 'Art Collector'],
  'High-net-worth individual going through divorce proceedings. Estimated settlement of $80M. Passionate about contemporary art. Needs guidance on asset protection and creating a new financial identity.',
  80000000,
  '2024-09-28'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Dr. Marcus Chen',
  'dr.chen@chenmedical.com',
  '+1 (858) 555-0123',
  'Chen Medical Group',
  'new',
  ARRAY['Medical Practice', 'Retirement Planning'],
  'Orthopedic surgeon, age 58, planning to sell practice in 3-5 years. Current net worth approximately $12M. Wife is an architect. Two children in college. Conservative investment philosophy.',
  12000000,
  '2024-10-13'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Sophia Vanderbilt-Ross',
  'sophia@vanderbilttrust.com',
  '+1 (212) 555-0234',
  'Vanderbilt Trust',
  'warm',
  ARRAY['Inherited Wealth', 'Philanthropy'],
  'Managing trustee of family trust worth $200M+. Age 35, interested in impact investing and establishing a private foundation. Yale graduate, board member of three major museums.',
  200000000,
  '2024-10-07'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Robert & Catherine Sterling',
  'rsterling@sterlingent.com',
  '+1 (404) 555-0345',
  'Sterling Enterprises',
  'contacted',
  ARRAY['Business Owners', 'Succession Planning'],
  'Fourth-generation family business (manufacturing). Annual revenue $50M. Three adult children, only one interested in business. Need succession and liquidity planning. Combined net worth $85M.',
  85000000,
  '2024-10-06'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Step 4: Insert Sample Interactions
-- ============================================

-- Get the prospect IDs we just created (for Alexandra Pemberton)
INSERT INTO interactions (advisor_id, prospect_id, interaction_type, subject, notes, interaction_date)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  'Call',
  'Initial discovery call',
  'Initial discovery call. Very impressed with our ESG offerings. Discussed portfolio diversification strategies and timeline for transitioning from real estate to mixed asset allocation.',
  '2024-10-10'
FROM prospects p
WHERE p.name = 'Alexandra Pemberton' AND p.advisor_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO interactions (advisor_id, prospect_id, interaction_type, subject, notes, interaction_date)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  'Email',
  'Introduction package sent',
  'Sent introduction package and fee schedule. Included case studies of similar clients and our approach to sustainable real estate investing.',
  '2024-10-05'
FROM prospects p
WHERE p.name = 'Alexandra Pemberton' AND p.advisor_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT DO NOTHING;

-- James Hartford III interactions
INSERT INTO interactions (advisor_id, prospect_id, interaction_type, subject, notes, interaction_date)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  'Meeting',
  'Club meeting',
  'Met at the club. Discussed tax-loss harvesting strategies and charitable remainder trusts. He is very focused on minimizing tax burden while maintaining liquidity.',
  '2024-10-12'
FROM prospects p
WHERE p.name = 'James Hartford III' AND p.advisor_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO interactions (advisor_id, prospect_id, interaction_type, subject, notes, interaction_date)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  'Call',
  'Estate planning follow-up',
  'Follow-up on estate planning documents. Introduced him to our estate planning attorney partner. Discussion about setting up trusts for children.',
  '2024-10-08'
FROM prospects p
WHERE p.name = 'James Hartford III' AND p.advisor_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO interactions (advisor_id, prospect_id, interaction_type, subject, notes, interaction_date)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  'Email',
  'Referral from Richard Ashford',
  'Referral from existing client Richard Ashford. Initial outreach email sent with our credentials and approach. Warm introduction.',
  '2024-10-01'
FROM prospects p
WHERE p.name = 'James Hartford III' AND p.advisor_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- Step 5: Verify Data
-- ============================================

-- Check that everything was created successfully
SELECT 'Advisors' as table_name, COUNT(*) as count FROM advisors WHERE id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients WHERE advisor_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Prospects', COUNT(*) FROM prospects WHERE advisor_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Interactions', COUNT(*) FROM interactions WHERE advisor_id = '00000000-0000-0000-0000-000000000001';

-- ============================================
-- Done! You should see:
-- - 1 advisor
-- - 5 clients
-- - 6 prospects
-- - 5 interactions
-- ============================================
