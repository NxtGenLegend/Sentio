-- ============================================
-- ADD SAMPLE DATA TO EXISTING PROSPECTS
-- ============================================
-- This script will add comprehensive information to existing prospects
-- so you can see the conditional display in action
-- ============================================

-- First, let's see what prospects we have
SELECT id, name, email, company, status FROM prospects ORDER BY created_at;

-- Update prospects with comprehensive information
-- Update Prospect 1 (assuming Sarah Johnson from typical seed data)
UPDATE prospects
SET
  middle_name = 'Elizabeth',
  date_of_birth = '1985-06-15',
  place_of_birth = 'Boston, MA',
  primary_email = email,
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
  notes = 'Referred by Margaret Whitmore. Interested in ESG investing and impact funds. Recently sold startup for $5M. Looking for comprehensive wealth management.'
WHERE name ILIKE '%sarah%' OR email ILIKE '%sarah%'
LIMIT 1;

-- Update Prospect 2 (assuming Michael Chen from typical seed data)
UPDATE prospects
SET
  middle_name = 'Wei',
  date_of_birth = '1978-03-22',
  place_of_birth = 'San Francisco, CA',
  primary_email = email,
  mobile_phone = '(415) 555-0567',
  secondary_email = 'michael.personal@gmail.com',
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
  notes = 'High net worth individual. Former Goldman Sachs VP. Founded own hedge fund. Interested in alternative investments and cryptocurrency exposure.'
WHERE name ILIKE '%michael%' OR name ILIKE '%chen%'
LIMIT 1;

-- Update Prospect 3 (assuming Jennifer Martinez from typical seed data)
UPDATE prospects
SET
  middle_name = 'Marie',
  date_of_birth = '1990-11-08',
  place_of_birth = 'Miami, FL',
  primary_email = email,
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
  notes = 'Third-generation real estate developer. Large portfolio of commercial properties in Miami. Interested in diversifying beyond real estate into equities and bonds.'
WHERE name ILIKE '%jennifer%' OR name ILIKE '%martinez%'
LIMIT 1;

-- Update Prospect 4 - Add a retired prospect
UPDATE prospects
SET
  date_of_birth = '1955-04-12',
  place_of_birth = 'Chicago, IL',
  primary_email = email,
  mobile_phone = phone,
  legal_street = '875 North Michigan Avenue',
  legal_city = 'Chicago',
  legal_state = 'IL',
  legal_zip = '60611',
  us_citizen = true,
  employment_status = 'retired',
  occupation = 'Former CEO (Retired)',
  education_level = 'MBA',
  estimated_aum = 22000000,
  notes = 'Recently retired from Fortune 500 company. Received large severance package and stock options. Looking for conservative wealth preservation strategy.'
WHERE name ILIKE '%david%' OR name ILIKE '%robert%'
LIMIT 1;

-- Update Prospect 5 - Add a not employed prospect
UPDATE prospects
SET
  date_of_birth = '1982-09-25',
  primary_email = email,
  mobile_phone = phone,
  legal_street = '200 Park Avenue',
  legal_city = 'New York',
  legal_state = 'NY',
  legal_zip = '10166',
  us_citizen = true,
  employment_status = 'not_employed',
  education_level = 'PhD',
  estimated_aum = 4500000,
  notes = 'Trust fund beneficiary. Family wealth from pharmaceutical business. Involved in philanthropic work. Looking for socially responsible investment options.'
WHERE name ILIKE '%emily%' OR name ILIKE '%jessica%'
LIMIT 1;

-- Update Prospect 6 - Add international prospect with compliance flags
UPDATE prospects
SET
  date_of_birth = '1970-07-18',
  place_of_birth = 'London, UK',
  primary_email = email,
  mobile_phone = phone,
  work_phone = '+44 20 7123 4567',
  preferred_phone = 'work',
  legal_street = '1 Wall Street, Floor 42',
  legal_city = 'New York',
  legal_state = 'NY',
  legal_zip = '10005',
  us_citizen = false,
  country_of_citizenship = 'United Kingdom',
  country_of_tax_residence = 'United States',
  residency_status = 'non_permanent',
  employment_status = 'employed',
  employer_name = 'Global Investment Bank',
  occupation = 'Managing Director',
  education_level = 'MBA',
  is_affiliated_finra = true,
  estimated_aum = 12000000,
  notes = 'UK citizen working in US on visa. FINRA affiliated due to position at investment bank. Needs specialized wealth management understanding regulatory requirements.'
WHERE name NOT IN (
  SELECT name FROM prospects WHERE
    name ILIKE '%sarah%' OR
    name ILIKE '%michael%' OR
    name ILIKE '%chen%' OR
    name ILIKE '%jennifer%' OR
    name ILIKE '%martinez%' OR
    name ILIKE '%david%' OR
    name ILIKE '%robert%' OR
    name ILIKE '%emily%' OR
    name ILIKE '%jessica%'
)
LIMIT 1;

-- Verification: Show updated prospects with new fields
SELECT
  id,
  name,
  company,
  status,
  estimated_aum,
  employment_status,
  occupation,
  legal_city || ', ' || legal_state as location,
  CASE
    WHEN date_of_birth IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_personal_info,
  CASE
    WHEN legal_street IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_address
FROM prospects
ORDER BY estimated_aum DESC NULLS LAST;

-- Summary counts
SELECT
  COUNT(*) as total_prospects,
  COUNT(date_of_birth) as with_dob,
  COUNT(legal_street) as with_address,
  COUNT(employment_status) as with_employment,
  COUNT(estimated_aum) as with_aum
FROM prospects;

-- ============================================
-- Expected Results:
-- - 6+ prospects with comprehensive information
-- - Various employment statuses (employed, retired, not_employed)
-- - Mix of citizen/non-citizen
-- - Estimated AUM values for sorting
-- - Rich notes for context
-- ============================================
