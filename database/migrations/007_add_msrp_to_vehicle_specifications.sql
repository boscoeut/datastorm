-- Add MSRP to Vehicle Specifications Migration
-- Migration: 007_add_msrp_to_vehicle_specifications.sql
-- Description: Adds approximate MSRP column to vehicle_specifications table

-- Add MSRP column to vehicle_specifications table
ALTER TABLE vehicle_specifications 
ADD COLUMN IF NOT EXISTS msrp_usd DECIMAL(10,2);

-- Add index for MSRP filtering and sorting
CREATE INDEX IF NOT EXISTS idx_specs_msrp ON vehicle_specifications(msrp_usd);

-- Add comment to document the column
COMMENT ON COLUMN vehicle_specifications.msrp_usd IS 'Approximate Manufacturer Suggested Retail Price in USD';
