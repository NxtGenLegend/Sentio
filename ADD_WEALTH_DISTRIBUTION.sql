-- ============================================
-- ADD WEALTH DISTRIBUTION & PORTFOLIO TABLES
-- ============================================
-- This script will:
-- 1. Create holdings table for client assets
-- 2. Create account_allocations for portfolio breakdown
-- 3. Add sample data for existing clients
-- ============================================

-- STEP 1: Create holdings table
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- 'stock', 'bond', 'real_estate', 'cash', 'alternative', 'crypto'
  asset_name TEXT NOT NULL,
  ticker_symbol TEXT,
  quantity DECIMAL(18, 4),
  current_value DECIMAL(15, 2) NOT NULL,
  cost_basis DECIMAL(15, 2),
  allocation_percentage DECIMAL(5, 2),
  account_name TEXT, -- e.g., "Brokerage", "IRA", "Trust Account"
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Create portfolio allocations table (for pie chart visualization)
CREATE TABLE IF NOT EXISTS portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'Equities', 'Fixed Income', 'Real Estate', 'Cash', 'Alternatives'
  subcategory TEXT, -- 'US Stocks', 'International Bonds', etc.
  value DECIMAL(15, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  color TEXT, -- Hex color for visualization
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create account summary table
CREATE TABLE IF NOT EXISTS client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL, -- 'brokerage', 'ira', 'roth_ira', '401k', 'trust', 'joint'
  account_name TEXT NOT NULL,
  account_number TEXT,
  custodian TEXT, -- e.g., "Fidelity", "Vanguard"
  balance DECIMAL(15, 2) NOT NULL,
  as_of_date DATE DEFAULT CURRENT_DATE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Insert sample portfolio data for Richard Ashford
-- Get Richard's client_id first
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

  -- Richard Ashford's Portfolio ($42.5M)
  IF richard_id IS NOT NULL THEN
    -- Portfolio Allocations
    INSERT INTO portfolio_allocations (client_id, category, subcategory, value, percentage, color) VALUES
    (richard_id, 'Real Estate', 'Manhattan Properties', 15000000, 35.29, '#8B4513'),
    (richard_id, 'Real Estate', 'Commercial REITs', 5000000, 11.76, '#A0522D'),
    (richard_id, 'Equities', 'US Large Cap', 10000000, 23.53, '#4169E1'),
    (richard_id, 'Equities', 'International', 3500000, 8.24, '#6495ED'),
    (richard_id, 'Fixed Income', 'Municipal Bonds', 6000000, 14.12, '#228B22'),
    (richard_id, 'Fixed Income', 'Corporate Bonds', 2000000, 4.71, '#32CD32'),
    (richard_id, 'Cash & Equivalents', 'Money Market', 1000000, 2.35, '#FFD700');

    -- Accounts
    INSERT INTO client_accounts (client_id, account_type, account_name, custodian, balance, is_primary) VALUES
    (richard_id, 'trust', 'Ashford Family Trust', 'JP Morgan Private Bank', 25000000, true),
    (richard_id, 'brokerage', 'Individual Brokerage', 'Fidelity', 12500000, false),
    (richard_id, 'ira', 'Traditional IRA', 'Vanguard', 5000000, false);
  END IF;

  -- Margaret Whitmore's Portfolio ($78.2M)
  IF margaret_id IS NOT NULL THEN
    -- Portfolio Allocations
    INSERT INTO portfolio_allocations (client_id, category, subcategory, value, percentage, color) VALUES
    (margaret_id, 'Equities', 'ESG Funds', 25000000, 31.97, '#228B22'),
    (margaret_id, 'Equities', 'Impact Investing', 15000000, 19.18, '#32CD32'),
    (margaret_id, 'Alternatives', 'Private Equity', 18000000, 23.02, '#8B008B'),
    (margaret_id, 'Alternatives', 'Hedge Funds', 8000000, 10.23, '#9932CC'),
    (margaret_id, 'Fixed Income', 'Green Bonds', 10000000, 12.79, '#006400'),
    (margaret_id, 'Cash & Equivalents', 'Money Market', 2200000, 2.81, '#FFD700');

    -- Accounts
    INSERT INTO client_accounts (client_id, account_type, account_name, custodian, balance, is_primary) VALUES
    (margaret_id, 'trust', 'Whitmore Foundation Trust', 'Morgan Stanley', 60000000, true),
    (margaret_id, 'brokerage', 'Personal Account', 'Charles Schwab', 18200000, false);
  END IF;

  -- Harrison Blackwell's Portfolio ($31.8M)
  IF harrison_id IS NOT NULL THEN
    -- Portfolio Allocations
    INSERT INTO portfolio_allocations (client_id, category, subcategory, value, percentage, color) VALUES
    (harrison_id, 'Equities', 'Technology Stocks', 15000000, 47.17, '#4169E1'),
    (harrison_id, 'Equities', 'Growth Stocks', 5000000, 15.72, '#6495ED'),
    (harrison_id, 'Alternatives', 'Venture Capital', 8000000, 25.16, '#8B008B'),
    (harrison_id, 'Alternatives', 'Cryptocurrency', 2000000, 6.29, '#FF8C00'),
    (harrison_id, 'Cash & Equivalents', 'Money Market', 1800000, 5.66, '#FFD700');

    -- Accounts
    INSERT INTO client_accounts (client_id, account_type, account_name, custodian, balance, is_primary) VALUES
    (harrison_id, 'brokerage', 'Trading Account', 'Interactive Brokers', 20000000, true),
    (harrison_id, '401k', 'Blackwell Ventures 401k', 'Fidelity', 8000000, false),
    (harrison_id, 'brokerage', 'Crypto Holdings', 'Coinbase Custody', 3800000, false);
  END IF;
END $$;

-- STEP 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_holdings_client ON holdings(client_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_client ON portfolio_allocations(client_id);
CREATE INDEX IF NOT EXISTS idx_accounts_client ON client_accounts(client_id);

-- STEP 6: Verification
SELECT
  c.first_name || ' ' || c.last_name as client_name,
  c.aum,
  COUNT(DISTINCT pa.id) as allocation_count,
  COUNT(DISTINCT ca.id) as account_count
FROM clients c
LEFT JOIN portfolio_allocations pa ON c.id = pa.client_id
LEFT JOIN client_accounts ca ON c.id = ca.client_id
GROUP BY c.id, c.first_name, c.last_name, c.aum
ORDER BY c.last_name;

-- ============================================
-- Expected Results:
-- - 3 new tables created (holdings, portfolio_allocations, client_accounts)
-- - Sample portfolio data for all 3 clients
-- - Ready for wealth distribution visualization
-- ============================================
