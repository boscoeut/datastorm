# Authentication Setup Guide

This guide explains how to set up authentication for the Electric Vehicle Data Hub application.

## Overview

The application now includes Supabase authentication with role-based access control:

- **Guests**: Can access Vehicle Database, Vehicle Battle, and Industry News pages
- **Authenticated Users**: Can access all guest features
- **Admins**: Can access all features including Chat and SQL pages

## Database Setup

### 1. Apply the User Roles Migration

Run the migration to create the user roles system:

```sql
-- This migration is located at: database/migrations/004_user_roles_and_admin.sql
-- It creates:
-- - user_roles table
-- - Admin role checking functions
-- - Updated RLS policies
-- - Automatic role assignment for new users
```

### 2. Create the First Admin User

After applying the migration, you need to manually create the first admin user:

1. **Sign up a new user** through the application's sign-in form
2. **Get the user ID** from the Supabase dashboard (Auth > Users)
3. **Run this SQL command** in the Supabase SQL editor:

```sql
-- Replace 'your-user-id-here' with the actual user ID from step 2
INSERT INTO user_roles (user_id, role) 
VALUES ('your-user-id-here', 'admin');
```

## Features

### Authentication Components

- **AuthButton**: Shows in the header - displays sign in/out button or user info
- **LoginForm**: Modal form for user authentication
- **ProtectedRoute**: Wrapper component for admin-only pages

### Navigation

The navigation automatically updates based on authentication status:
- **Public pages**: Always visible (Vehicles, Battle, News)
- **Admin pages**: Only visible to authenticated admin users (Chat, SQL)

### Database Security

All database operations are protected by Row Level Security (RLS):
- **Read access**: Public for most data (vehicles, news, etc.)
- **Write access**: Admin-only for all data modifications
- **User preferences**: Users can only access their own data

## Usage

### For Users

1. **Browse as guest**: All public features are available without login
2. **Sign in**: Click "Sign In" in the header to access additional features
3. **Admin access**: Contact an administrator to get admin privileges

### For Administrators

1. **Sign in**: Use your admin credentials
2. **Access admin features**: Chat and SQL pages will be visible in navigation
3. **Manage data**: Full access to create, update, and delete database records

## Security Notes

- All admin operations require authentication and admin role
- User roles are stored securely in the database
- RLS policies prevent unauthorized access at the database level
- Session management is handled by Supabase Auth

## Troubleshooting

### Common Issues

1. **"Access Denied" on admin pages**: Ensure user has admin role in database
2. **Navigation not updating**: Check that authentication state is loading properly
3. **Database errors**: Verify RLS policies are correctly applied

### Checking User Roles

To check if a user has admin privileges:

```sql
SELECT u.email, ur.role 
FROM auth.users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id 
WHERE u.email = 'user@example.com';
```

### Making a User Admin

To promote a user to admin:

```sql
-- Replace with actual user ID
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'user-id-here';
```
