-- Vehicle Image Storage Migration
-- Migration: 002_vehicle_image_storage.sql
-- Description: Adds image storage capabilities for vehicles using Supabase Storage

-- Add profile image URL to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS profile_image_path VARCHAR(500);

-- Create vehicle_images table for gallery images
CREATE TABLE IF NOT EXISTS vehicle_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  image_name VARCHAR(255) NOT NULL,
  image_type VARCHAR(100),
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for vehicle images
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_display_order ON vehicle_images(display_order);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_active ON vehicle_images(is_active);

-- Enable RLS on vehicle_images table
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicle_images
CREATE POLICY "Vehicle images are viewable by everyone" ON vehicle_images
  FOR SELECT USING (true);

CREATE POLICY "Users can insert vehicle images" ON vehicle_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update vehicle images" ON vehicle_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete vehicle images" ON vehicle_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at column on vehicle_images
CREATE TRIGGER update_vehicle_images_updated_at BEFORE UPDATE ON vehicle_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get vehicle images with proper ordering
CREATE OR REPLACE FUNCTION get_vehicle_images(p_vehicle_id UUID)
RETURNS TABLE (
  id UUID,
  image_url VARCHAR(500),
  image_path VARCHAR(500),
  image_name VARCHAR(255),
  image_type VARCHAR(100),
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  alt_text VARCHAR(255),
  display_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vi.id,
    vi.image_url,
    vi.image_path,
    vi.image_name,
    vi.image_type,
    vi.file_size,
    vi.width,
    vi.height,
    vi.alt_text,
    vi.display_order,
    vi.is_active,
    vi.created_at
  FROM vehicle_images vi
  WHERE vi.vehicle_id = p_vehicle_id 
    AND vi.is_active = true
  ORDER BY vi.display_order ASC, vi.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reorder vehicle images
CREATE OR REPLACE FUNCTION reorder_vehicle_images(
  p_vehicle_id UUID,
  p_image_orders JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  image_order JSONB;
  image_id UUID;
  new_order INTEGER;
BEGIN
  -- Validate input
  IF p_image_orders IS NULL OR jsonb_typeof(p_image_orders) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Update display order for each image
  FOR image_order IN SELECT * FROM jsonb_array_elements(p_image_orders)
  LOOP
    image_id := (image_order->>'id')::UUID;
    new_order := (image_order->>'order')::INTEGER;
    
    UPDATE vehicle_images 
    SET display_order = new_order, updated_at = NOW()
    WHERE id = image_id AND vehicle_id = p_vehicle_id;
  END LOOP;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_vehicle_images(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reorder_vehicle_images(UUID, JSONB) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE vehicle_images IS 'Stores gallery images for vehicles with metadata and ordering';
COMMENT ON COLUMN vehicle_images.display_order IS 'Order for displaying images in gallery (lower numbers first)';
COMMENT ON COLUMN vehicle_images.is_active IS 'Whether the image should be displayed (soft delete)';
COMMENT ON FUNCTION get_vehicle_images(UUID) IS 'Returns ordered list of active images for a vehicle';
COMMENT ON FUNCTION reorder_vehicle_images(UUID, JSONB) IS 'Updates display order of vehicle images';
