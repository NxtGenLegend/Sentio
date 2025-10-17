-- ============================================
-- UPDATE PROSPECTS SCHEMA - ADD ALL CLIENT FIELDS
-- ============================================
-- This script will:
-- 1. Add all comprehensive client fields to prospects table
-- 2. Keep existing prospects data intact
-- 3. Allow prospects to have complete KYC information
-- ============================================

-- Add all the new fields to prospects table
ALTER TABLE prospects
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
ADD COLUMN IF NOT EXISTS ssn TEXT,
ADD COLUMN IF NOT EXISTS mothers_maiden_name TEXT,

-- Contact fields (some already exist, adding missing ones)
ADD COLUMN IF NOT EXISTS mobile_phone TEXT,
ADD COLUMN IF NOT EXISTS work_phone TEXT,
ADD COLUMN IF NOT EXISTS home_phone TEXT,
ADD COLUMN IF NOT EXISTS preferred_phone TEXT,
ADD COLUMN IF NOT EXISTS primary_email TEXT,
ADD COLUMN IF NOT EXISTS secondary_email TEXT,

-- Address Information
ADD COLUMN IF NOT EXISTS legal_street TEXT,
ADD COLUMN IF NOT EXISTS legal_city TEXT,
ADD COLUMN IF NOT EXISTS legal_state TEXT,
ADD COLUMN IF NOT EXISTS legal_zip TEXT,
ADD COLUMN IF NOT EXISTS mailing_street TEXT,
ADD COLUMN IF NOT EXISTS mailing_city TEXT,
ADD COLUMN IF NOT EXISTS mailing_state TEXT,
ADD COLUMN IF NOT EXISTS mailing_zip TEXT,

-- Citizenship & Residency
ADD COLUMN IF NOT EXISTS us_citizen BOOLEAN,
ADD COLUMN IF NOT EXISTS country_of_citizenship TEXT,
ADD COLUMN IF NOT EXISTS country_of_tax_residence TEXT,
ADD COLUMN IF NOT EXISTS residency_status TEXT,

-- Employment Information
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS employer_name TEXT,
ADD COLUMN IF NOT EXISTS business_street TEXT,
ADD COLUMN IF NOT EXISTS business_city TEXT,
ADD COLUMN IF NOT EXISTS business_state TEXT,
ADD COLUMN IF NOT EXISTS business_zip TEXT,
ADD COLUMN IF NOT EXISTS tenure_years INTEGER,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,

-- Security & Compliance
ADD COLUMN IF NOT EXISTS money_movement_password TEXT,
ADD COLUMN IF NOT EXISTS is_foreign_political_figure BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_control_person BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_affiliated_finra BOOLEAN DEFAULT false,

-- Financial Information
ADD COLUMN IF NOT EXISTS estimated_aum DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS account_type TEXT;

-- Copy existing data to new fields where applicable
UPDATE prospects
SET primary_email = email
WHERE email IS NOT NULL AND primary_email IS NULL;

UPDATE prospects
SET mobile_phone = phone
WHERE phone IS NOT NULL AND mobile_phone IS NULL;

-- Verification: Show current prospects with new fields
SELECT
  id,
  name,
  primary_email,
  mobile_phone,
  status,
  employment_status,
  estimated_aum
FROM prospects
ORDER BY updated_at DESC;

-- ============================================
-- Expected Results:
-- - Prospects table now has all client fields
-- - Existing prospect data preserved
-- - Ready for comprehensive prospect information
-- ============================================
