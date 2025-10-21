# Final Instructions - Run These Scripts

## ⚠️ IMPORTANT: Run in This Exact Order

### Step 1: Fix the Alert Configs Schema ✅
**File**: `FIX_ALERT_CONFIGS_SCHEMA_V2.sql`

This script:
- Adds missing columns (`excluded_keywords`, `email_notifications`, `sms_notifications`)
- Renames existing columns to match UI expectations
  - `categories` → `categories_enabled`
  - `min_priority` → `priority_threshold`
- Adds a unique constraint on `client_id`

```sql
-- Copy FIX_ALERT_CONFIGS_SCHEMA_V2.sql into Supabase SQL Editor
-- Click "Run"
```

**Expected Result**: You should see a table showing all 10 columns in alert_configs

### Step 2: Add All Seed Data ✅
**File**: `COMPLETE_SEED_DATA.sql`

This script populates:
- 10+ news alerts for Richard, Margaret, and Harrison
- 3 alert configurations with custom keywords
- 4+ prospect interactions
- Enhanced prospect data (addresses, employment, AUM, etc.)

```sql
-- Copy COMPLETE_SEED_DATA.sql into Supabase SQL Editor
-- Click "Run"
```

**Expected Result**:
```
News Alerts: 10+
Alert Configs: 3
Interactions: 4+
Holdings: ~30
Portfolio Allocations: ~15
Client Accounts: 9
```

## 🎯 What This Fixes

### The Problem
Your alert_configs table was created with:
- `min_priority` instead of `priority_threshold`
- `categories` instead of `categories_enabled`
- Missing: `excluded_keywords`, `email_notifications`, `sms_notifications`

### The Solution
The V2 schema fix:
1. **Renames** existing columns to match the UI
2. **Adds** missing columns the UI needs
3. **Sets defaults** so everything works immediately

## ✅ After Running Both Scripts

You should now have:
- ✅ Fully compatible alert_configs table
- ✅ Working "Configure Alerts" button in client detail pages
- ✅ News alerts visible in News Alerts page
- ✅ Prospect interactions timeline
- ✅ Enhanced prospect KYC data
- ✅ Portfolio visualizations (from previous scripts)

## 🔍 Quick Test

After running both scripts:

1. **Go to Clients page** → Click Richard Ashford
2. **Click "Configure Alerts"** button
3. **Should see**:
   - Keywords: real estate, commercial property, trust, Park Avenue, Manhattan
   - Excluded: spam, advertisement, promotional
   - Priority: Medium
   - All 3 categories enabled

4. **Go to News Alerts page**
5. **Should see** 10+ alerts for your 3 clients

6. **Go to Prospects page** → Click any prospect
7. **Should see** comprehensive information (addresses, employment, etc.)

## 🆘 If Still Getting Errors

Run this diagnostic query:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alert_configs'
ORDER BY ordinal_position;
```

Share the output with me and I'll create a custom fix!

---

**These are the CORRECT scripts to run!**
- `FIX_ALERT_CONFIGS_SCHEMA_V2.sql` (Step 1)
- `COMPLETE_SEED_DATA.sql` (Step 2)
