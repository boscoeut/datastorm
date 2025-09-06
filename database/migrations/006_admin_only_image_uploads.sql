-- Admin Only Image Uploads
-- Migration: 006_admin_only_image_uploads.sql
-- Description: Updates RLS policies to restrict image uploads to admin users only

-- Drop existing policies for vehicle_images
DROP POLICY IF EXISTS "Users can insert vehicle images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Users can update vehicle images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Users can delete vehicle images" ON public.vehicle_images;

-- Create new admin-only policies for vehicle_images
CREATE POLICY "Admins can insert vehicle images" ON public.vehicle_images
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update vehicle images" ON public.vehicle_images
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete vehicle images" ON public.vehicle_images
  FOR DELETE USING (is_admin());

-- Update the functions to require admin permissions
-- Drop and recreate the reorder function with admin check
DROP FUNCTION IF EXISTS reorder_vehicle_images(UUID, JSONB);

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
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN FALSE;
  END IF;

  -- Validate input
  IF p_image_orders IS NULL OR jsonb_typeof(p_image_orders) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Update display order for each image
  FOR image_order IN SELECT * FROM jsonb_array_elements(p_image_orders)
  LOOP
    image_id := (image_order->>'id')::UUID;
    new_order := (image_order->>'order')::INTEGER;
    
    UPDATE public.vehicle_images 
    SET display_order = new_order, updated_at = NOW()
    WHERE id = image_id AND vehicle_id = p_vehicle_id;
  END LOOP;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update grant permissions to only admins
REVOKE EXECUTE ON FUNCTION reorder_vehicle_images(UUID, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION reorder_vehicle_images(UUID, JSONB) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION reorder_vehicle_images(UUID, JSONB) IS 'Updates display order of vehicle images (admin only)';
