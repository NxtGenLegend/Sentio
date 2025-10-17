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

Connect to your PostgreSQL database and run:

```sql
-- Create client_dashboards table to store React Flow layouts
CREATE TABLE IF NOT EXISTS client_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);

-- Add index on client_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_dashboards_client_id ON client_dashboards(client_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_dashboards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_dashboards_updated_at
  BEFORE UPDATE ON client_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_client_dashboards_updated_at();

-- Grant permissions
GRANT ALL ON client_dashboards TO authenticated;
GRANT ALL ON client_dashboards TO service_role;
```

### Verification

After running the migration, test the dashboard save functionality:

1. Navigate to a client's dashboard page
2. Add some widgets using the "Add Asset" button
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
