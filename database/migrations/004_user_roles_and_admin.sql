-- User Roles and Admin Functionality
-- Migration: 004_user_roles_and_admin.sql
-- Description: Adds user roles and admin functionality to the database

-- Create public.user_roles table to manage user permissions
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for public.user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS on public.user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for public.user_roles
-- Users can view their own role
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can insert/update/delete roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_roles 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at on public.user_roles
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user role (you'll need to replace with actual admin user ID)
-- This should be done manually after creating the first admin user
-- INSERT INTO public.user_roles (user_id, role) VALUES ('<admin-user-id>', 'admin');

-- Update RLS policies for existing tables to include admin checks

-- Update manufacturers policies to allow admin-only write operations
DROP POLICY IF EXISTS "Admins can insert manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Admins can update manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Admins can delete manufacturers" ON public.manufacturers;

CREATE POLICY "Admins can insert manufacturers" ON public.manufacturers
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update manufacturers" ON public.manufacturers
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete manufacturers" ON public.manufacturers
  FOR DELETE USING (is_admin());

-- Update vehicles policies to allow admin-only write operations
DROP POLICY IF EXISTS "Admins can insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can delete vehicles" ON public.vehicles;

CREATE POLICY "Admins can insert vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update vehicles" ON public.vehicles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete vehicles" ON public.vehicles
  FOR DELETE USING (is_admin());

-- Update vehicle_specifications policies to allow admin-only write operations
DROP POLICY IF EXISTS "Admins can insert specifications" ON public.vehicle_specifications;
DROP POLICY IF EXISTS "Admins can update specifications" ON public.vehicle_specifications;
DROP POLICY IF EXISTS "Admins can delete specifications" ON public.vehicle_specifications;

CREATE POLICY "Admins can insert specifications" ON public.vehicle_specifications
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update specifications" ON public.vehicle_specifications
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete specifications" ON public.vehicle_specifications
  FOR DELETE USING (is_admin());

-- Update news_articles policies to allow admin-only write operations
DROP POLICY IF EXISTS "Admins can insert news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Admins can update news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Admins can delete news articles" ON public.news_articles;

CREATE POLICY "Admins can insert news articles" ON public.news_articles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update news articles" ON public.news_articles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete news articles" ON public.news_articles
  FOR DELETE USING (is_admin());

-- Create a function to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically assign role to new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
