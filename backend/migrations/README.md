# Database Migrations

This folder contains all SQL migration files for the Sentio database.

## Core Migrations

### `create_client_dashboards.sql`
Creates the `client_dashboards` table for storing React Flow widget layouts in JSONB format. Includes triggers for automatic `updated_at` timestamp updates.

**Usage**: Run this migration to enable the dashboard save functionality.

## Schema Management

### `FIX_ALL_SCHEMA_ISSUES.sql`
Comprehensive schema fix that addresses all known schema issues across tables.

### `FIX_ALERT_CONFIGS_SCHEMA.sql` & `FIX_ALERT_CONFIGS_SCHEMA_V2.sql`
Fixes and updates to the `alert_configs` table schema for client news preferences.

### `UPDATE_CLIENT_SCHEMA.sql`
Updates to the `clients` table schema.

### `UPDATE_PROSPECTS_SCHEMA.sql`
Updates to the `prospects` table schema.

### `CHECK_ALERT_CONFIGS_SCHEMA.sql`
Diagnostic script to verify alert_configs table structure.

## Data Population

### `COMPLETE_SEED_DATA.sql`
Complete seed data for testing including clients, prospects, and alert configurations.

### `POPULATE_DATABASE.sql`
Initial database population script with sample data.

### `ADD_PROSPECT_SAMPLE_DATA.sql`
Adds sample prospect data for testing.

### `ADD_WEALTH_DISTRIBUTION.sql`
Adds wealth distribution categories and data to prospects.

## News & Alerts

### `CREATE_NEWS_ARTICLES_TABLE.sql`
Creates the `news_alerts` table for storing matched news articles per client.

## Maintenance

### `CLEANUP_DATABASE.sql`
Cleans up test data and resets database to clean state.

### `REMOVE_DUPLICATES.sql`
Removes duplicate entries from database tables.

## Running Migrations

### Option 1: Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the migration file content
4. Click "Run"

### Option 2: Command Line
```bash
psql -h <host> -U <user> -d <database> -f <migration-file.sql>
```

## Migration Order

For a fresh database setup, run migrations in this order:

1. `UPDATE_CLIENT_SCHEMA.sql`
2. `UPDATE_PROSPECTS_SCHEMA.sql`
3. `FIX_ALL_SCHEMA_ISSUES.sql`
4. `create_client_dashboards.sql`
5. `CREATE_NEWS_ARTICLES_TABLE.sql`
6. `COMPLETE_SEED_DATA.sql` (for testing)

## Notes

- Always backup your database before running migrations
- Test migrations on a development database first
- Check for schema conflicts before running multiple migrations
- Some migrations may contain `DROP TABLE IF EXISTS` statements - review carefully
