-- Current Models Only Migration
-- Migration: 005_current_models_only.sql
-- Description: Modifies the database to focus on current models only, removing year-based tracking

-- First, let's add a new column to track if a vehicle is currently available
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS is_currently_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS model_year INTEGER; -- Keep year for reference but not as primary identifier

-- Update existing vehicles to be marked as current
UPDATE vehicles SET is_currently_available = true WHERE is_currently_available IS NULL;






-- Drop the old unique constraint (if it existed)
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_manufacturer_id_model_year_trim_key;

-- ------------------------------------------------------------------
-- 1️⃣  Add a *partial* unique index instead of a partial constraint
-- ------------------------------------------------------------------
-- This enforces uniqueness of (manufacturer_id, model, trim) **only**
-- for rows where `is_currently_available = true`.
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_current_model_unique_idx
ON vehicles (manufacturer_id, model, trim)
WHERE is_currently_available = true;


-- Create index for current vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_current ON vehicles(is_currently_available) 
WHERE is_currently_available = true;

-- Create a view for current vehicles only
CREATE OR REPLACE VIEW current_vehicles AS
SELECT 
  v.*,
  m.name as manufacturer_name,
  m.country as manufacturer_country,
  m.website as manufacturer_website,
  m.logo_url as manufacturer_logo_url
FROM vehicles v
JOIN manufacturers m ON v.manufacturer_id = m.id
WHERE v.is_currently_available = true;

-- Create a view for current vehicles with specifications
CREATE OR REPLACE VIEW current_vehicles_with_specs AS
SELECT 
  v.*,
  m.name as manufacturer_name,
  m.country as manufacturer_country,
  m.website as manufacturer_website,
  m.logo_url as manufacturer_logo_url,
  vs.battery_capacity_kwh,
  vs.range_miles,
  vs.power_hp,
  vs.torque_lb_ft,
  vs.acceleration_0_60,
  vs.top_speed_mph,
  vs.weight_lbs,
  vs.length_inches,
  vs.width_inches,
  vs.height_inches,
  vs.cargo_capacity_cu_ft,
  vs.seating_capacity
FROM vehicles v
JOIN manufacturers m ON v.manufacturer_id = m.id
LEFT JOIN vehicle_specifications vs ON v.id = vs.vehicle_id
WHERE v.is_currently_available = true;

-- Update RLS policies to work with current vehicles view
-- The existing policies will work, but we can add a policy specifically for current vehicles
CREATE POLICY "Current vehicles are viewable by everyone" ON vehicles
  FOR SELECT USING (is_currently_available = true);

-- Add a comment to clarify the new approach
COMMENT ON TABLE vehicles IS 'Vehicle table focusing on current models only. Use is_currently_available flag to filter current models.';
COMMENT ON COLUMN vehicles.is_currently_available IS 'Flag indicating if this vehicle model is currently available for purchase';
COMMENT ON COLUMN vehicles.model_year IS 'Year of the model for reference purposes only, not used for uniqueness';
COMMENT ON VIEW current_vehicles IS 'View showing only currently available vehicle models';
COMMENT ON VIEW current_vehicles_with_specs IS 'View showing currently available vehicles with their specifications';
