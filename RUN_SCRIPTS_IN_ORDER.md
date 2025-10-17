# Run SQL Scripts in This Order

## ⚠️ Important: Follow This Sequence

You're getting the error because the `alert_configs` table is missing the `excluded_keywords` column. Run these scripts IN ORDER:

### Step 1: Fix Alert Configs Schema ✅ **RUN THIS FIRST**
**File**: `FIX_ALERT_CONFIGS_SCHEMA.sql`

This adds the missing `excluded_keywords` column to the `alert_configs` table.

```sql
-- Copy and paste FIX_ALERT_CONFIGS_SCHEMA.sql into Supabase SQL Editor
-- Then click "Run"
```

**Expected Result**: You should see a table showing all columns in alert_configs, including the new `excluded_keywords` column.

### Step 2: Add Complete Seed Data ✅ **RUN THIS SECOND**
**File**: `COMPLETE_SEED_DATA.sql`

This populates all your tables with comprehensive sample data.

```sql
-- Copy and paste COMPLETE_SEED_DATA.sql into Supabase SQL Editor
-- Then click "Run"
```

**Expected Result**:
- 10+ news alerts
- 3 alert configurations
- 4+ prospect interactions
- Updated prospect information

### Step 3: Verify Data ✅
The COMPLETE_SEED_DATA.sql script includes verification queries at the end. After running it, you should see:

```
News Alerts: 10+
Alert Configs: 3
Interactions: 4+
Holdings: ~30
Portfolio Allocations: ~15
Client Accounts: 9
```

## 🔍 Why This Error Happened

The `alert_configs` table was created without the `excluded_keywords` column, but:
1. The UI code expects it (for the "Excluded Keywords" feature)
2. The seed data script tries to insert it

The fix script adds the missing column so everything works together.

## ✅ After Running Both Scripts

You should now have:
- ✅ Complete alert_configs schema with excluded_keywords
- ✅ News alerts for all 3 clients
- ✅ Alert configurations with keywords
- ✅ Prospect interactions
- ✅ Enhanced prospect data
- ✅ Working "Configure Alerts" UI

## 🎯 Quick Troubleshooting

If you still get an error after Step 1, it might mean one of these:

1. **Different column name**: Run this query to check:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'alert_configs';
```

2. **Table doesn't exist**: You may need to create the table first. Let me know and I'll create that script.

---

**Once both scripts run successfully, your application will be fully functional!**
