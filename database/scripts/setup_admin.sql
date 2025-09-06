-- Admin Setup Script
-- This script helps set up the first admin user
-- Run this after applying the 004_user_roles_and_admin.sql migration

-- Step 1: Check if user_roles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE EXCEPTION 'user_roles table does not exist. Please run the 004_user_roles_and_admin.sql migration first.';
    END IF;
END $$;

-- Step 2: Show current users (for reference)
SELECT 
    u.id,
    u.email,
    u.created_at,
    ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- Step 3: Instructions for creating admin user
-- To make a user an admin, run:
-- UPDATE user_roles SET role = 'admin' WHERE user_id = 'USER_ID_HERE';
-- 
-- Or to insert a new admin role:
-- INSERT INTO user_roles (user_id, role) VALUES ('USER_ID_HERE', 'admin');

-- Step 4: Verify admin functions work
SELECT 
    'Admin functions test' as test_name,
    is_admin() as current_user_is_admin,
    get_user_role() as current_user_role;

-- Step 5: Show RLS policies status
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'manufacturers', 'vehicles', 'news_articles')
ORDER BY tablename, policyname;
