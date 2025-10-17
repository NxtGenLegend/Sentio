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
