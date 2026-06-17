-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  type TEXT,
  handover TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units table
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  unit_number TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Apartment', 'Townhouse')),
  bedrooms TEXT NOT NULL,
  sub_type TEXT,
  view TEXT,
  floor TEXT,
  internal_area NUMERIC NOT NULL DEFAULT 0,
  external_area NUMERIC NOT NULL DEFAULT 0,
  total_area NUMERIC NOT NULL DEFAULT 0,
  plot_area NUMERIC,
  price_aed NUMERIC NOT NULL DEFAULT 0,
  payment_plan TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_units_project_id ON units(project_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_category ON units(category);
CREATE INDEX idx_units_bedrooms ON units(bedrooms);

-- Enable Row Level Security (open for now, restrict later)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read units" ON units FOR SELECT USING (true);

-- Allow public write access (will restrict with auth in v2)
CREATE POLICY "Public insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Public delete projects" ON projects FOR DELETE USING (true);

CREATE POLICY "Public insert units" ON units FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update units" ON units FOR UPDATE USING (true);
CREATE POLICY "Public delete units" ON units FOR DELETE USING (true);
