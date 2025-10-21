# Simple Fix Instructions

## Run These 2 Scripts In Order

### Step 1: Fix All Schema Issues ✅
**File**: `FIX_ALL_SCHEMA_ISSUES.sql`

**What it does:**
- Fixes `alert_configs` table (adds missing columns, renames existing ones)
- Fixes `interactions` table (adds missing `outcome` column)
- Shows you all columns in both tables for verification

**How to run:**
1. Open Supabase SQL Editor
2. Copy entire contents of `FIX_ALL_SCHEMA_ISSUES.sql`
3. Paste into editor
4. Click "Run"

**Expected result:** You'll see two tables showing all columns

---

### Step 2: Add All Sample Data ✅
**File**: `COMPLETE_SEED_DATA.sql`

**What it does:**
- Adds 10+ news alerts for your clients
- Adds 3 alert configurations (Richard, Margaret, Harrison)
- Adds 4+ prospect interactions
- Updates prospects with comprehensive KYC data

**How to run:**
1. In Supabase SQL Editor
2. Copy entire contents of `COMPLETE_SEED_DATA.sql`
3. Paste into editor
4. Click "Run"

**Expected result:** You'll see verification tables showing all your data

---

## That's It!

After running both scripts:
- ✅ All tables will be properly structured
- ✅ All sample data will be populated
- ✅ "Configure Alerts" button will work
- ✅ News Alerts page will show articles
- ✅ Prospects will have detailed information
- ✅ No more schema errors!

## Quick Verification

After running, check:

1. **News Alerts**: Go to News Alerts page → should see 10+ articles
2. **Configure Alerts**: Click any client → Click "Configure Alerts" → should open modal with keywords
3. **Prospects**: Go to Prospects → Click any → should see detailed information

---

**If you still get an error**, copy the error message and the output of this query:

```sql
-- Copy this into Supabase and share the results
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('alert_configs', 'interactions', 'prospects', 'news_alerts')
ORDER BY table_name, ordinal_position;
```
