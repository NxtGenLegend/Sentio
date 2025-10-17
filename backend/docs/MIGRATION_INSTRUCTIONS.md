# Database Migration Instructions

## Dashboard Functionality Setup

The client dashboard feature requires a database table to save widget layouts. Follow these steps to enable the save functionality:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `/backend/migrations/create_client_dashboards.sql`
5. Click **Run** to execute the migration
6. Verify the table was created by going to **Table Editor** and checking for `client_dashboards`

### Option 2: Using Supabase CLI

```bash
# Navigate to backend directory
cd backend

# Run the migration
supabase db push migrations/create_client_dashboards.sql
```

### Option 3: Direct SQL Execution

Connect to your PostgreSQL database and run the migration file located at:
```
backend/migrations/create_client_dashboards.sql
```

### Verification

After running the migration, test the dashboard save functionality:

1. Navigate to a client's dashboard page
2. Add some widgets using the "Add Widget" button
3. Arrange them on the canvas
4. Click "Save Layout"
5. Refresh the page - your widgets should still be there!

### What This Enables

- **Persistent Layouts**: Save widget positions and connections
- **Per-Client Customization**: Each client can have their own unique dashboard
- **Auto-save on Change**: Layouts are stored in JSONB format for flexibility
- **Timestamps**: Track when dashboards were created and last modified

### Troubleshooting

If you see an error like:
```
Could not find the table 'public.client_dashboards' in the schema cache
```

This means the migration hasn't been run yet. Follow the steps above to create the table.

### Migration File Location

The migration SQL file is located at:
```
backend/migrations/create_client_dashboards.sql
```
