-- ============================================
-- UPDATE CLIENT SCHEMA FOR DETAILED PROFILES
-- ============================================
-- This script will:
-- 1. Drop existing clients table
-- 2. Create new clients table with comprehensive fields
-- 3. Recreate necessary data
-- ============================================

-- STEP 1: Drop existing tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS news_alerts CASCADE;
DROP TABLE IF EXISTS alert_configs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- STEP 2: Create new clients table with all required fields
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL,

  -- Basic Information
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  place_of_birth TEXT,
  ssn TEXT, -- Stored encrypted in production
  mothers_maiden_name TEXT,

  -- Contact Information
  mobile_phone TEXT,
  work_phone TEXT,
  home_phone TEXT,
  preferred_phone TEXT, -- 'mobile', 'work', or 'home'
  primary_email TEXT,
  secondary_email TEXT,

  -- Address Information
  legal_street TEXT,
  legal_city TEXT,
  legal_state TEXT,
  legal_zip TEXT,
  mailing_street TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,

  -- Citizenship & Residency
  us_citizen BOOLEAN DEFAULT true,
  country_of_citizenship TEXT,
  country_of_tax_residence TEXT,
  residency_status TEXT, -- 'permanent', 'non_permanent', 'nonresident'

  -- Employment Information
  employment_status TEXT, -- 'employed', 'not_employed', 'retired'
  employer_name TEXT,
  business_street TEXT,
  business_city TEXT,
  business_state TEXT,
  business_zip TEXT,
  tenure_years INTEGER,
  occupation TEXT,
  education_level TEXT,

  -- Security & Compliance
  money_movement_password TEXT,
  is_foreign_political_figure BOOLEAN DEFAULT false,
  is_control_person BOOLEAN DEFAULT false,
  is_affiliated_finra BOOLEAN DEFAULT false,

  -- Financial Information
  aum DECIMAL(15, 2) DEFAULT 0,
  client_since DATE,
  account_type TEXT DEFAULT 'individual', -- 'individual', 'joint', 'trust', 'corporate'

  -- Profile & Notes
  profile JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  status TEXT DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create alert_configs table
CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  keywords TEXT[],
  categories TEXT[],
  min_priority TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Create news_alerts table
CREATE TABLE news_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  source TEXT,
  published_at TIMESTAMPTZ,
  priority TEXT, -- 'high', 'medium', 'low'
  category TEXT,
  tags TEXT[],
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  relevance_score DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, url)
);

-- STEP 5: Insert sample clients with detailed information
INSERT INTO clients (
  advisor_id,
  first_name,
  middle_name,
  last_name,
  date_of_birth,
  place_of_birth,
  mobile_phone,
  preferred_phone,
  primary_email,
  legal_street,
  legal_city,
  legal_state,
  legal_zip,
  us_citizen,
  employment_status,
  employer_name,
  occupation,
  education_level,
  aum,
  client_since,
  account_type,
  profile,
  notes,
  status
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Richard',
  'Alexander',
  'Ashford',
  '1965-04-15',
  'New York, NY',
  '(212) 555-0101',
  'mobile',
  'richard.ashford@ashfordfamily.com',
  '740 Park Avenue, Apt 12B',
  'New York',
  'NY',
  '10021',
  true,
  'retired',
  'Ashford Capital Partners (Former)',
  'Investment Banker (Retired)',
  'MBA',
  42500000,
  '2019-03-15',
  'joint',
  '{"holdings": ["Real Estate", "Equities", "Bonds"], "interests": ["Real Estate Investment", "Luxury Properties"], "riskTolerance": "moderate", "investmentStyle": "balanced", "tags": ["Real Estate", "Manhattan"]}'::jsonb,
  'Third-generation wealth. Primary focus on real estate holdings in Manhattan. Conservative investor with long-term outlook.',
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Margaret',
  'Elizabeth',
  'Whitmore',
  '1958-08-22',
  'Boston, MA',
  '(617) 555-0102',
  'mobile',
  'margaret@whitmoretrust.com',
  '1200 Beacon Street',
  'Brookline',
  'MA',
  '02446',
  true,
  'retired',
  'Whitmore Foundation (Trustee)',
  'Philanthropist / Trust Manager',
  'PhD',
  78200000,
  '2015-06-01',
  'trust',
  '{"holdings": ["ESG Funds", "Private Equity", "Impact Investments"], "interests": ["ESG Investing", "Impact Funds", "Sustainable Investing"], "riskTolerance": "moderate-aggressive", "investmentStyle": "growth", "tags": ["ESG", "Philanthropy"]}'::jsonb,
  'Managing trustee of family trust. Strong focus on ESG and impact investing. Board member of three major museums.',
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Harrison',
  'James',
  'Blackwell',
  '1972-11-30',
  'San Francisco, CA',
  '(415) 555-0103',
  'mobile',
  'harrison@blackwellcapital.com',
  '2600 Pacific Avenue',
  'San Francisco',
  'CA',
  '94115',
  true,
  'employed',
  'Blackwell Ventures',
  'Venture Capitalist',
  'MBA',
  31800000,
  '2021-01-20',
  'individual',
  '{"holdings": ["Technology Stocks", "Venture Capital", "Cryptocurrencies"], "interests": ["Technology Sector", "AI", "Cloud Computing", "NASDAQ"], "riskTolerance": "aggressive", "investmentStyle": "growth", "tags": ["Tech", "VC"]}'::jsonb,
  'Tech investor and venture capitalist. High risk tolerance. Active in AI and cloud computing sectors.',
  'active'
);

-- STEP 6: Create indexes for performance
CREATE INDEX idx_clients_advisor ON clients(advisor_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_news_client ON news_alerts(client_id);
CREATE INDEX idx_news_published ON news_alerts(published_at DESC);

-- STEP 7: Verification
SELECT
  id,
  first_name || ' ' || last_name as full_name,
  primary_email,
  aum,
  client_since,
  employment_status,
  occupation
FROM clients
ORDER BY created_at;

-- ============================================
-- Expected Results:
-- - 3 clients with comprehensive profiles
-- - All new fields available for data entry
-- - Ready for client detail page
-- ============================================
