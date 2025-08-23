-- Initial Database Schema for Electric Vehicle Data Hub
-- Migration: 001_initial_schema.sql
-- Description: Creates the core database structure with tables, indexes, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100),
  website VARCHAR(500),
  logo_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
  model VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  trim VARCHAR(255),
  body_style VARCHAR(100),
  is_electric BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manufacturer_id, model, year, trim)
);

-- Create vehicle_specifications table
CREATE TABLE IF NOT EXISTS vehicle_specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  battery_capacity_kwh DECIMAL(6,2),
  range_miles INTEGER,
  power_hp INTEGER,
  torque_lb_ft INTEGER,
  acceleration_0_60 DECIMAL(4,2),
  top_speed_mph INTEGER,
  weight_lbs INTEGER,
  length_inches DECIMAL(5,2),
  width_inches DECIMAL(5,2),
  height_inches DECIMAL(5,2),
  cargo_capacity_cu_ft DECIMAL(4,2),
  seating_capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market_data table
CREATE TABLE IF NOT EXISTS market_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  msrp DECIMAL(10,2),
  current_price DECIMAL(10,2),
  inventory_count INTEGER,
  days_on_market INTEGER,
  market_trend VARCHAR(50),
  region VARCHAR(100),
  data_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  summary VARCHAR(1000),
  source_url VARCHAR(500),
  source_name VARCHAR(255),
  published_date TIMESTAMP WITH TIME ZONE,
  category VARCHAR(100),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_vehicles UUID[],
  search_history JSONB,
  filter_preferences JSONB,
  notification_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
-- Vehicle search indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_manufacturer_model ON vehicles(manufacturer_id, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_body_style ON vehicles(body_style);
CREATE INDEX IF NOT EXISTS idx_vehicles_electric ON vehicles(is_electric);

-- Specification search indexes
CREATE INDEX IF NOT EXISTS idx_specs_battery_capacity ON vehicle_specifications(battery_capacity_kwh);
CREATE INDEX IF NOT EXISTS idx_specs_range ON vehicle_specifications(range_miles);
CREATE INDEX IF NOT EXISTS idx_specs_power ON vehicle_specifications(power_hp);
CREATE INDEX IF NOT EXISTS idx_specs_vehicle_id ON vehicle_specifications(vehicle_id);

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_market_vehicle_date ON market_data(vehicle_id, data_date);
CREATE INDEX IF NOT EXISTS idx_market_price ON market_data(current_price);
CREATE INDEX IF NOT EXISTS idx_market_region ON market_data(region);
CREATE INDEX IF NOT EXISTS idx_market_trend ON market_data(market_trend);

-- News indexes
CREATE INDEX IF NOT EXISTS idx_news_published_date ON news_articles(published_date);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_title ON news_articles USING GIN(to_tsvector('english', title));

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prefs_favorites ON user_preferences USING GIN(favorite_vehicles);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Manufacturers: Read access for all, write for authenticated users
CREATE POLICY "Manufacturers are viewable by everyone" ON manufacturers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert manufacturers" ON manufacturers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update manufacturers" ON manufacturers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete manufacturers" ON manufacturers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Vehicles: Read access for all, write for authenticated users
CREATE POLICY "Vehicles are viewable by everyone" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update vehicles" ON vehicles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete vehicles" ON vehicles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Specifications: Read access for all, write for authenticated users
CREATE POLICY "Specifications are viewable by everyone" ON vehicle_specifications
  FOR SELECT USING (true);

CREATE POLICY "Users can insert specifications" ON vehicle_specifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update specifications" ON vehicle_specifications
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete specifications" ON vehicle_specifications
  FOR DELETE USING (auth.role() = 'authenticated');

-- Market data: Read access for all, write for authenticated users
CREATE POLICY "Market data is viewable by everyone" ON market_data
  FOR SELECT USING (true);

CREATE POLICY "Users can insert market data" ON market_data
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update market data" ON market_data
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete market data" ON market_data
  FOR DELETE USING (auth.role() = 'authenticated');

-- News articles: Read access for all, write for authenticated users
CREATE POLICY "News articles are viewable by everyone" ON news_articles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert news articles" ON news_articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update news articles" ON news_articles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete news articles" ON news_articles
  FOR DELETE USING (auth.role() = 'authenticated');

-- User preferences: Users can only access their own data
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_specifications_updated_at BEFORE UPDATE ON vehicle_specifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_data_updated_at BEFORE UPDATE ON market_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO manufacturers (name, country, website) VALUES
  ('Tesla', 'USA', 'https://www.tesla.com'),
  ('Ford', 'USA', 'https://www.ford.com'),
  ('General Motors', 'USA', 'https://www.gm.com'),
  ('Volkswagen', 'Germany', 'https://www.vw.com'),
  ('BMW', 'Germany', 'https://www.bmw.com')
ON CONFLICT (name) DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (manufacturer_id, model, year, trim, body_style, is_electric) 
SELECT 
  m.id,
  'Model 3',
  2024,
  'Long Range',
  'Sedan',
  true
FROM manufacturers m WHERE m.name = 'Tesla'
ON CONFLICT DO NOTHING;

INSERT INTO vehicles (manufacturer_id, model, year, trim, body_style, is_electric)
SELECT 
  m.id,
  'F-150 Lightning',
  2024,
  'Platinum',
  'Pickup Truck',
  true
FROM manufacturers m WHERE m.name = 'Ford'
ON CONFLICT DO NOTHING;

-- Insert sample specifications
INSERT INTO vehicle_specifications (vehicle_id, battery_capacity_kwh, range_miles, power_hp, acceleration_0_60)
SELECT 
  v.id,
  82.0,
  341,
  450,
  3.7
FROM vehicles v 
JOIN manufacturers m ON v.manufacturer_id = m.id 
WHERE m.name = 'Tesla' AND v.model = 'Model 3'
ON CONFLICT DO NOTHING;

-- Insert sample market data
INSERT INTO market_data (vehicle_id, msrp, current_price, inventory_count, region, data_date)
SELECT 
  v.id,
  45990.00,
  45990.00,
  15,
  'California',
  CURRENT_DATE
FROM vehicles v 
JOIN manufacturers m ON v.manufacturer_id = m.id 
WHERE m.name = 'Tesla' AND v.model = 'Model 3'
ON CONFLICT DO NOTHING;

-- Insert sample news articles
INSERT INTO news_articles (title, summary, source_name, category, tags) VALUES
  ('Electric Vehicle Sales Surge in Q4 2024', 'Electric vehicle sales have reached record numbers in the fourth quarter of 2024, with Tesla leading the market.', 'EV News Daily', 'Market Trends', ARRAY['sales', 'tesla', 'market-trends']),
  ('New Battery Technology Promises 500-Mile Range', 'Breakthrough in battery technology could enable electric vehicles to travel 500 miles on a single charge.', 'Tech Auto Weekly', 'Technology', ARRAY['battery', 'technology', 'range']),
  ('Government Announces New EV Incentives', 'Federal government introduces new tax credits and incentives for electric vehicle purchases.', 'Policy Review', 'Policy', ARRAY['incentives', 'tax-credits', 'government'])
ON CONFLICT DO NOTHING;
