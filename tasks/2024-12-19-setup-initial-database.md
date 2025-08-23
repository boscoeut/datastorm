# Task: Setup Initial Database

**Created:** 2024-12-19
**Priority:** High
**Complexity:** Moderate
**Status:** Not Started

## Task Description
Set up the initial database structure for the Electric Vehicle Data Hub project using the existing Supabase project. This includes creating the database schema, setting up Row Level Security (RLS) policies, configuring authentication, and establishing the data models for vehicles, specifications, market data, and user preferences. The database will serve as the foundation for all data operations including real-time subscriptions, user authentication, and data persistence.

## Requirements

### Functional Requirements
- [ ] Connect to existing Supabase project and verify connection
- [ ] Create database schema for vehicles, specifications, market data, and user preferences
- [ ] Implement Row Level Security (RLS) policies for data access control
- [ ] Set up authentication tables and user management
- [ ] Create database indexes for optimal query performance
- [ ] Establish real-time subscription capabilities for live data updates
- [ ] Set up database migrations for version-controlled schema changes

### Non-Functional Requirements
- [ ] Database performance must support concurrent user access and real-time updates
- [ ] Security must follow Supabase best practices with proper RLS implementation
- [ ] Schema must be normalized and optimized for the EV data use case
- [ ] Database must support the data volume requirements outlined in PRD success metrics

### Technical Requirements
- [ ] Use Supabase PostgreSQL with built-in authentication and authorization
- [ ] Implement database schema following TECHNICAL_SPEC data architecture patterns
- [ ] Set up proper TypeScript interfaces matching database schema
- [ ] Configure environment variables for secure database connection
- [ ] Implement database connection utilities following TECHNICAL_SPEC patterns

## Implementation Steps

### Phase 1: Supabase Project Connection Setup
1. [ ] **Get Supabase Project Credentials**
   - Navigate to your Supabase dashboard at https://supabase.com/dashboard
   - Select your existing project
   - Go to Settings → API
   - Copy the following credentials:
     - Project URL
     - Project API Key (anon/public key)
     - Service Role Key (for admin operations)
     - Database Password (if you have direct database access)

2. [ ] **Configure Environment Variables**
   - Create/update `.env.local` file in project root
   - Add Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```
   - Add `.env.local` to `.gitignore` if not already there

3. [ ] **Install Supabase Client Dependencies**
   - Install required packages:
     ```bash
     npm install @supabase/supabase-js
     npm install @supabase/auth-helpers-react
     npm install @supabase/auth-ui-react
     npm install @supabase/auth-ui-shared
     ```

### Phase 2: Database Schema Creation
1. [ ] **Create Core Tables**
   - **manufacturers** table:
     ```sql
     CREATE TABLE manufacturers (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       name VARCHAR(255) NOT NULL UNIQUE,
       country VARCHAR(100),
       website VARCHAR(500),
       logo_url VARCHAR(500),
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```

   - **vehicles** table:
     ```sql
     CREATE TABLE vehicles (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       manufacturer_id UUID REFERENCES manufacturers(id),
       model VARCHAR(255) NOT NULL,
       year INTEGER NOT NULL,
       trim VARCHAR(255),
       body_style VARCHAR(100),
       is_electric BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(manufacturer_id, model, year, trim)
     );
     ```

   - **vehicle_specifications** table:
     ```sql
     CREATE TABLE vehicle_specifications (
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
     ```

   - **market_data** table:
     ```sql
     CREATE TABLE market_data (
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
     ```

   - **news_articles** table:
     ```sql
     CREATE TABLE news_articles (
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
     ```

   - **user_preferences** table:
     ```sql
     CREATE TABLE user_preferences (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       favorite_vehicles UUID[],
       search_history JSONB,
       filter_preferences JSONB,
       notification_settings JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```

2. [ ] **Create Indexes for Performance**
   ```sql
   -- Vehicle search indexes
   CREATE INDEX idx_vehicles_manufacturer_model ON vehicles(manufacturer_id, model);
   CREATE INDEX idx_vehicles_year ON vehicles(year);
   CREATE INDEX idx_vehicles_body_style ON vehicles(body_style);
   
   -- Specification search indexes
   CREATE INDEX idx_specs_battery_capacity ON vehicle_specifications(battery_capacity_kwh);
   CREATE INDEX idx_specs_range ON vehicle_specifications(range_miles);
   CREATE INDEX idx_specs_power ON vehicle_specifications(power_hp);
   
   -- Market data indexes
   CREATE INDEX idx_market_vehicle_date ON market_data(vehicle_id, data_date);
   CREATE INDEX idx_market_price ON market_data(current_price);
   CREATE INDEX idx_market_region ON market_data(region);
   
   -- News indexes
   CREATE INDEX idx_news_published_date ON news_articles(published_date);
   CREATE INDEX idx_news_category ON news_articles(category);
   CREATE INDEX idx_news_tags ON news_articles USING GIN(tags);
   ```

### Phase 3: Row Level Security (RLS) Implementation
1. [ ] **Enable RLS on All Tables**
   ```sql
   ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE vehicle_specifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
   ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
   ```

2. [ ] **Create RLS Policies**
   ```sql
   -- Manufacturers: Read access for all, write for authenticated users
   CREATE POLICY "Manufacturers are viewable by everyone" ON manufacturers
     FOR SELECT USING (true);
   
   CREATE POLICY "Users can insert manufacturers" ON manufacturers
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   -- Vehicles: Read access for all, write for authenticated users
   CREATE POLICY "Vehicles are viewable by everyone" ON vehicles
     FOR SELECT USING (true);
   
   CREATE POLICY "Users can insert vehicles" ON vehicles
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   -- Specifications: Read access for all, write for authenticated users
   CREATE POLICY "Specifications are viewable by everyone" ON vehicle_specifications
     FOR SELECT USING (true);
   
   CREATE POLICY "Users can insert specifications" ON vehicle_specifications
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   -- Market data: Read access for all, write for authenticated users
   CREATE POLICY "Market data is viewable by everyone" ON market_data
     FOR SELECT USING (true);
   
   CREATE POLICY "Users can insert market data" ON market_data
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   -- News: Read access for all, write for authenticated users
   CREATE POLICY "News articles are viewable by everyone" ON news_articles
     FOR SELECT USING (true);
   
   CREATE POLICY "Users can insert news articles" ON news_articles
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   -- User preferences: Users can only access their own data
   CREATE POLICY "Users can view own preferences" ON user_preferences
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own preferences" ON user_preferences
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own preferences" ON user_preferences
     FOR UPDATE USING (auth.uid() = user_id);
   ```

### Phase 4: Database Utilities and Configuration
1. [ ] **Create Supabase Client Configuration**
   - Create `src/lib/supabase.ts`:
     ```typescript
     import { createClient } from '@supabase/supabase-js'
     
     const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
     const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
     
     if (!supabaseUrl || !supabaseAnonKey) {
       throw new Error('Missing Supabase environment variables')
     }
     
     export const supabase = createClient(supabaseUrl, supabaseAnonKey)
     ```

2. [ ] **Create Database Type Definitions**
   - Create `src/types/database.ts` with TypeScript interfaces matching the database schema
   - Export types for use throughout the application

3. [ ] **Set up Database Connection Utilities**
   - Create database service functions for common operations
   - Implement error handling and connection management

### Phase 5: Authentication Setup
1. [ ] **Configure Supabase Auth Settings**
   - In Supabase dashboard, go to Authentication → Settings
   - Configure email confirmation settings
   - Set up password policies
   - Configure OAuth providers if needed (Google, GitHub, etc.)

2. [ ] **Create Auth Context and Hooks**
   - Set up React context for authentication state
   - Create custom hooks for auth operations
   - Implement protected route components

### Phase 6: Testing and Validation
1. [ ] **Test Database Connection**
   - Verify connection to Supabase project
   - Test basic CRUD operations on all tables
   - Verify RLS policies are working correctly

2. [ ] **Test Authentication Flow**
   - Test user registration and login
   - Verify user preferences table access
   - Test protected routes and data access

3. [ ] **Performance Testing**
   - Test query performance with sample data
   - Verify indexes are working correctly
   - Test real-time subscription capabilities

## Files to Modify/Create
- [ ] `.env.local` - Environment variables for Supabase connection
- [ ] `src/lib/supabase.ts` - Supabase client configuration
- [ ] `src/types/database.ts` - Database type definitions
- [ ] `src/services/database.ts` - Database service functions
- [ ] `src/contexts/AuthContext.tsx` - Authentication context
- [ ] `src/hooks/useAuth.ts` - Authentication hooks
- [ ] `src/components/auth/` - Authentication components directory
- [ ] `database/migrations/` - Database migration files directory

## Dependencies to Add
- [ ] `@supabase/supabase-js` - Latest version - Core Supabase client
- [ ] `@supabase/auth-helpers-react` - Latest version - React auth helpers
- [ ] `@supabase/auth-ui-react` - Latest version - Pre-built auth UI components
- [ ] `@supabase/auth-ui-shared` - Latest version - Shared auth UI utilities

## Testing Checklist
- [ ] Database connection test - verify connection to existing Supabase project
- [ ] Schema creation test - all tables created successfully
- [ ] RLS policy test - verify data access control is working
- [ ] Authentication test - user registration, login, and session management
- [ ] CRUD operations test - create, read, update, delete operations on all tables
- [ ] Performance test - verify indexes and query performance
- [ ] Real-time test - test subscription capabilities
- [ ] Security test - verify RLS policies prevent unauthorized access

## Acceptance Criteria
- [ ] Successfully connected to existing Supabase project with environment variables
- [ ] All database tables created with proper schema and relationships
- [ ] RLS policies implemented and tested for data security
- [ ] Database indexes created for optimal query performance
- [ ] Authentication system configured and functional
- [ ] TypeScript types created matching database schema
- [ ] Database utilities and services implemented following TECHNICAL_SPEC patterns
- [ ] Real-time subscription capabilities verified and working
- [ ] No console errors or connection issues
- [ ] Database performance meets requirements for concurrent user access

## Notes and Considerations

### Supabase Project Connection Requirements
**IMPORTANT:** Before starting this task, you need to gather the following information from your existing Supabase project:

1. **Project URL**: Found in Settings → API → Project URL
2. **API Keys**: 
   - Anon/Public key (for client-side operations)
   - Service Role key (for admin operations - keep this secret!)
3. **Database Password**: If you need direct database access
4. **Project Region**: For performance optimization

### Security Considerations
- Never commit API keys or sensitive credentials to version control
- Use environment variables for all sensitive configuration
- Service Role key should only be used server-side or for admin operations
- Anon key is safe to use in client-side code

### Database Design Notes
- The schema follows normalization principles for data integrity
- RLS policies ensure users can only access appropriate data
- Indexes are optimized for common query patterns in EV data applications
- Real-time subscriptions enable live updates for collaborative features

### Performance Considerations
- Database indexes are created for common search and filter operations
- Schema is designed to support the data volume requirements from PRD
- Real-time subscriptions are optimized for live data updates
- Connection pooling and query optimization follow Supabase best practices

## Example Usage

### Environment Setup
```bash
# Create environment file
cp .env.example .env.local

# Add your Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Database Connection Test
```typescript
import { supabase } from '@/lib/supabase'

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('Connection successful:', data)
  }
}
```

### Authentication Test
```typescript
import { supabase } from '@/lib/supabase'

// Test user registration
const testAuth = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  })
  
  if (error) {
    console.error('Auth error:', error)
  } else {
    console.log('Auth successful:', data)
  }
}
```

## Progress Log
- [2024-12-19] Task created
- [2024-12-19] Phase 1 completed: Supabase dependencies installed
- [2024-12-19] Phase 2 completed: Database schema created with all tables, indexes, and RLS policies
- [2024-12-19] Phase 3 completed: Supabase client configuration created
- [2024-12-19] Phase 4 completed: TypeScript type definitions created
- [2024-12-19] Phase 5 completed: Database service functions implemented
- [2024-12-19] Phase 6 completed: Authentication context and hooks created
- [2024-12-19] Phase 7 completed: Database migration files created
- [2024-12-19] Phase 8 completed: Database test component created and integrated
- [2024-12-19] Phase 9 completed: All TypeScript errors resolved
- [2024-12-19] Phase 10 completed: Database setup guide created

## Completion Notes
[To be filled when task is completed]
