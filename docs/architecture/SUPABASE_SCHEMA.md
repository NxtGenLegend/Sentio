# Supabase Setup Guide for Sentio

**Simple database schema for the Sentio wealth management platform.**

No Row Level Security (RLS) - keeping it super simple!

---

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to the SQL Editor in your Supabase dashboard

---

## Step 1: Drop Existing Tables (if they exist)

Run this in Supabase SQL Editor first to clean up any existing tables:

```sql
-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS alert_configs CASCADE;
DROP TABLE IF EXISTS news_alerts CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS advisors CASCADE;
```

---

## Step 2: Create Tables

Copy and paste this entire block into Supabase SQL Editor and run it:

```sql
-- 1. Advisors table
CREATE TABLE advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  firm TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  aum NUMERIC(15, 2),
  client_since DATE,
  account_type TEXT,
  profile JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_advisor ON clients(advisor_id);
CREATE INDEX idx_clients_status ON clients(status);

-- 3. Prospects table
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new',
  estimated_aum NUMERIC(15, 2),
  conversion_probability INTEGER,
  tags TEXT[],
  source TEXT,
  referral_source TEXT,
  notes TEXT,
  first_contact_date DATE,
  last_contact_date DATE,
  expected_close_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prospects_advisor ON prospects(advisor_id);
CREATE INDEX idx_prospects_status ON prospects(status);

-- 4. Interactions table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  subject TEXT,
  notes TEXT NOT NULL,
  interaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_prospect_or_client CHECK (
    (prospect_id IS NOT NULL AND client_id IS NULL) OR
    (prospect_id IS NULL AND client_id IS NOT NULL)
  )
);

CREATE INDEX idx_interactions_prospect ON interactions(prospect_id);
CREATE INDEX idx_interactions_client ON interactions(client_id);

-- 5. News alerts table
CREATE TABLE news_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT NOT NULL,
  source TEXT,
  author TEXT,
  image_url TEXT,
  relevance_score NUMERIC(3, 2),
  relevance_reason TEXT,
  priority TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_client ON news_alerts(client_id);
CREATE INDEX idx_news_priority ON news_alerts(priority);
CREATE UNIQUE INDEX idx_news_unique_url_client ON news_alerts(client_id, url);

-- 6. Alert configs table
CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keywords TEXT[],
  categories TEXT[],
  min_priority TEXT DEFAULT 'low',
  frequency TEXT DEFAULT 'realtime',
  email_enabled BOOLEAN DEFAULT TRUE,
  email_digest_time TIME DEFAULT '08:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Step 3: Insert Mock Data

**Important:** Replace `'YOUR-ADVISOR-ID'` with your actual advisor UUID below!

### Option A: Create a test advisor first

```sql
-- Insert a test advisor and get the ID
INSERT INTO advisors (name, email, firm)
VALUES ('Penelope Whitmore', 'p.whitmore@sentio.com', 'Sentio Wealth Management')
RETURNING id;

-- Copy the UUID that's returned, you'll use it below
```

### Option B: Use an existing advisor ID

If you already have an advisor in your database, get their ID:

```sql
SELECT id, name, email FROM advisors;
```

---

### Insert Mock Clients

**Replace `'YOUR-ADVISOR-ID'` with the UUID from above!**

```sql
INSERT INTO clients (advisor_id, name, aum, client_since, account_type, profile, status) VALUES
(
  'YOUR-ADVISOR-ID',
  'Richard & Margaret Ashford',
  42500000,
  '2019-01-15',
  'joint',
  '{"holdings": ["Real Estate", "Manhattan Properties", "Upper East Side"], "interests": ["Real Estate Investment", "Luxury Properties"], "riskTolerance": "moderate", "investmentStyle": "value", "tags": ["Real Estate", "Manhattan", "High Net Worth"]}'::jsonb,
  'active'
),
(
  'YOUR-ADVISOR-ID',
  'The Whitmore Family Trust',
  78200000,
  '2015-06-01',
  'trust',
  '{"holdings": ["ESG Funds", "Private Equity", "Sustainable Investments"], "interests": ["ESG Investing", "Impact Funds", "Private Equity"], "riskTolerance": "moderate-conservative", "investmentStyle": "ESG", "tags": ["ESG", "Sustainable Investing", "Private Equity", "Family Trust"]}'::jsonb,
  'active'
),
(
  'YOUR-ADVISOR-ID',
  'Harrison Blackwell',
  31800000,
  '2021-03-10',
  'individual',
  '{"holdings": ["Tech Stocks", "NASDAQ", "Growth Equities"], "interests": ["Technology Sector", "AI", "Cloud Computing"], "riskTolerance": "aggressive", "investmentStyle": "growth", "tags": ["Technology", "NASDAQ", "Growth Investing"]}'::jsonb,
  'active'
),
(
  'YOUR-ADVISOR-ID',
  'Eleanor Cunningham',
  19500000,
  '2020-07-22',
  'individual',
  '{"holdings": ["Art Collection", "Alternative Assets"], "interests": ["Contemporary Art", "Art Market", "Alternative Investments"], "riskTolerance": "moderate", "investmentStyle": "alternative", "tags": ["Art", "Alternative Assets", "Contemporary Art"]}'::jsonb,
  'active'
),
(
  'YOUR-ADVISOR-ID',
  'The Kensington Foundation',
  125000000,
  '2012-09-01',
  'foundation',
  '{"holdings": ["ESG Funds", "Impact Investments", "Sustainable Portfolio"], "interests": ["ESG", "Philanthropy", "Sustainable Investing", "Impact"], "riskTolerance": "conservative", "investmentStyle": "ESG", "tags": ["ESG", "Foundation", "Impact Investing", "Philanthropy"]}'::jsonb,
  'active'
);
```

---

### Insert Mock Prospects

**Replace `'YOUR-ADVISOR-ID'` with the UUID from above!**

```sql
INSERT INTO prospects (advisor_id, name, company, status, tags, notes, estimated_aum, first_contact_date) VALUES
(
  'YOUR-ADVISOR-ID',
  'Alexandra Pemberton',
  'Pemberton Holdings',
  'new',
  ARRAY['Family Office', 'Real Estate'],
  'Third-generation wealth. Interested in sustainable investing and impact portfolios. Currently holds $45M in real estate across Manhattan and the Hamptons. Looking to diversify into private equity.',
  45000000,
  '2024-10-05'
),
(
  'YOUR-ADVISOR-ID',
  'James Hartford III',
  'Hartford Capital',
  'contacted',
  ARRAY['Tech Founder', 'Exit Planning'],
  'Recently sold his fintech startup for $120M. Age 42, married with three children. Primary concerns: tax optimization, estate planning, and maintaining lifestyle post-exit.',
  120000000,
  '2024-10-01'
),
(
  'YOUR-ADVISOR-ID',
  'Victoria Ashford',
  'Independent',
  'contacted',
  ARRAY['Divorcee', 'Art Collector'],
  'High-net-worth individual going through divorce proceedings. Estimated settlement of $80M. Passionate about contemporary art. Needs guidance on asset protection and creating a new financial identity.',
  80000000,
  '2024-09-28'
),
(
  'YOUR-ADVISOR-ID',
  'Dr. Marcus Chen',
  'Chen Medical Group',
  'new',
  ARRAY['Medical Practice', 'Retirement Planning'],
  'Orthopedic surgeon, age 58, planning to sell practice in 3-5 years. Current net worth approximately $12M. Wife is an architect. Two children in college. Conservative investment philosophy.',
  12000000,
  '2024-10-13'
),
(
  'YOUR-ADVISOR-ID',
  'Sophia Vanderbilt-Ross',
  'Vanderbilt Trust',
  'warm',
  ARRAY['Inherited Wealth', 'Philanthropy'],
  'Managing trustee of family trust worth $200M+. Age 35, interested in impact investing and establishing a private foundation. Yale graduate, board member of three major museums.',
  200000000,
  '2024-10-07'
),
(
  'YOUR-ADVISOR-ID',
  'Robert & Catherine Sterling',
  'Sterling Enterprises',
  'contacted',
  ARRAY['Business Owners', 'Succession Planning'],
  'Fourth-generation family business (manufacturing). Annual revenue $50M. Three adult children, only one interested in business. Need succession and liquidity planning. Combined net worth $85M.',
  85000000,
  '2024-10-06'
);
```

---

## Step 4: Verify Your Data

Run these queries to make sure everything was inserted correctly:

```sql
-- Check clients
SELECT id, name, aum, client_since FROM clients ORDER BY name;

-- Check prospects
SELECT id, name, company, status, estimated_aum FROM prospects ORDER BY name;

-- Check advisors
SELECT id, name, email FROM advisors;
```

---

## Step 5: Configure Frontend Environment Variables

Create a `.env` file in your project root (if it doesn't exist already):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**To find these values:**
1. Go to your Supabase project dashboard
2. Click on "Project Settings" (gear icon in sidebar)
3. Click on "API" in the settings menu
4. Copy the "Project URL" → This is your `VITE_SUPABASE_URL`
5. Copy the "anon public" key → This is your `VITE_SUPABASE_ANON_KEY`

---

## Step 6: Run Your App

```bash
npm run dev
```

Your app should now load clients and prospects from Supabase!

---

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file is in the project root (same folder as `package.json`)
- Restart your dev server after creating/updating `.env`

### No data showing up
- Check that you replaced `'YOUR-ADVISOR-ID'` with your actual UUID
- Run the verification queries in Step 4 to confirm data was inserted
- Check browser console for errors

### "relation does not exist" error
- Make sure you ran the CREATE TABLE statements in Step 2
- Try dropping and recreating the tables

---

## Quick Reference: Profile JSONB Structure

```json
{
  "holdings": ["Real Estate", "Equities"],
  "interests": ["ESG Investing", "Technology"],
  "riskTolerance": "moderate",
  "investmentStyle": "growth",
  "tags": ["Real Estate", "High Net Worth"]
}
```

---

That's it! Your Supabase database is ready to use. 🎉
