# Update Vehicle Details Command

## Overview
This command instructs an agent to take a vehicle provided by the user and perform comprehensive updates including internet research, database updates, and news article collection.

## Prerequisites
- Access to Google Gemini API with web search capabilities
- **MCP Supabase tool** configured in Cursor for database operations (preferred method)
- **Alternative**: Node.js script with Supabase client and service role key (fallback method)
- Understanding of the database schema (vehicles, vehicle_specifications, news_articles tables)
- Service role key configured in MCP Supabase server settings or available in environment files

## Input Requirements
The agent should receive:
- **Vehicle identifier**: Manufacturer name and model (e.g., "Tesla Model 3", "Ford F-150 Lightning")
- **Optional**: Specific trim level, year, or other details if provided by user

**IMPORTANT**: Always prioritize the most recent model year available. If no specific year is provided, research and use the current/latest model year for the vehicle.

## Step-by-Step Instructions

### 1. Internet Research Phase

#### 1.1 Search for Vehicle Information
- Use Google Gemini with web search to gather comprehensive information about the vehicle
- **PRIORITY**: Focus on the most recent model year available (typically current year or next year)
- **Search Strategy**: Use multiple targeted searches for better results
- Search for:
  - **Latest model year** and available trims for that year
  - Technical specifications (battery capacity, range, power, etc.) for the most recent model
  - Pricing information (MSRP, current market prices) for current model year
  - Physical dimensions and features for the latest version
  - Availability status and production information for current model year
  - Any model year changes or updates that affect the most recent version
  - **Performance metrics**: 0-60 acceleration, top speed, towing capacity
  - **Safety ratings**: NHTSA, IIHS ratings and safety features
  - **Unique features**: Special technologies, design elements, or capabilities

#### 1.2 Search for News Articles
- Search for recent news articles (last 30 days) about the specific vehicle
- **Focus on current model year** news and updates
- **Search Strategy**: Use separate searches for different types of news
- Look for:
  - New model year announcements or updates for the latest version
  - Price changes or incentives for current model year
  - Production updates or delays affecting the most recent model
  - Reviews or comparisons of the latest model year
  - Regulatory news or recalls for current models
  - Technology updates or features in the most recent model year
  - **Performance achievements**: Speed records, awards, or recognition
  - **Safety updates**: New safety features or ratings improvements
  - **Market trends**: Sales performance, competition analysis

### 2. Database Update Phase

#### 2.0 Database Operations
**PREFERRED METHOD**: Use the **MCP Supabase tool** in Cursor:
- Use `mcp_supabase_execute_sql` for all SQL queries and operations
- Use `mcp_supabase_list_tables` to verify table structure if needed
- Use `mcp_supabase_list_projects` to confirm project access

**FALLBACK METHOD**: If MCP tools are unavailable, create a Node.js script:
- Use `@supabase/supabase-js` client with service role key
- Load environment variables from `web/.env.local` and `supabase/deploy/.env`
- Use service role key (`SUPABASE_SERVICE_ROLE_KEY`) for database operations
- Implement proper error handling and transaction management
- **Proven approach**: This method has been successfully tested with Tesla Cybertruck and Model X

**MCP Tool Usage Examples**:
- **Check if manufacturer exists**: `SELECT * FROM manufacturers WHERE name = 'Tesla'`
- **Insert new manufacturer**: `INSERT INTO manufacturers (name, country, website) VALUES ('Tesla', 'USA', 'https://tesla.com')`
- **Update vehicle record**: `UPDATE vehicles SET year = 2025, model_year = 2025, updated_at = NOW() WHERE id = 'vehicle-uuid'`
- **Insert news article**: `INSERT INTO news_articles (title, summary, source_url, category) VALUES (...)`

#### 2.1 Update vs Create Logic
**CRITICAL**: Always follow this pattern for all database operations:
1. **Check if record exists** using appropriate unique identifiers via MCP Supabase tool
2. **If record exists**: Update the existing record with new information using MCP Supabase tool
3. **If record does not exist**: Create a new record using MCP Supabase tool
4. **Never create duplicates** - always update existing records when found

#### 2.2 Update Vehicles Table
- **Check if manufacturer exists** in the `manufacturers` table using MCP Supabase tool
  - If not, create new manufacturer record with name, country, website using MCP Supabase tool
  - If exists, use existing manufacturer_id
- **Check if vehicle exists** in the `vehicles` table using MCP Supabase tool
  - Look for existing records with same manufacturer_id, model, and trim
  - **If vehicle exists**: Update the existing record with new information using MCP Supabase tool
  - **If vehicle does not exist**: Create a new vehicle record using MCP Supabase tool
- **Key fields to update/create**:
  - `model`: Vehicle model name
  - `year`: **Most recent model year** (required field, prioritize current year or next year)
  - `model_year`: **Most recent model year** (reference field, same as year)
  - `trim`: Trim level (if specified)
  - `body_style`: Vehicle body style (Sedan, SUV, Truck, etc.)
  - `is_electric`: Set to true for electric vehicles
  - `is_currently_available`: Set to true if currently in production/available for the most recent model year
  - `updated_at`: Current timestamp

**IMPORTANT**: The database schema has both `year` (required) and `model_year` (reference) columns. Always set both fields to the same value.

#### 2.3 Update Vehicle Specifications Table
- **For each trim level found for the most recent model year**, handle specifications in `vehicle_specifications` table using MCP Supabase tool
  - **If specifications exist for the vehicle**: Update the existing specification record with latest model year data using MCP Supabase tool
  - **If specifications do not exist**: Create a new specification record using MCP Supabase tool
- **Key specifications to include** (for the most recent model year):
  - `battery_capacity_kwh`: Battery capacity in kilowatt-hours
  - `range_miles`: EPA estimated range in miles
  - `power_hp`: Horsepower output
  - `torque_lb_ft`: Torque in pound-feet
  - `acceleration_0_60`: 0-60 mph acceleration time in seconds
  - `top_speed_mph`: Top speed in miles per hour
  - `weight_lbs`: Curb weight in pounds
  - `length_inches`: Vehicle length in inches
  - `width_inches`: Vehicle width in inches
  - `height_inches`: Vehicle height in inches
  - `cargo_capacity_cu_ft`: Cargo capacity in cubic feet
  - `seating_capacity`: Number of seats
  - **Additional metrics**: Towing capacity, drag coefficient, charging speed (if available)

#### 2.4 Handle Multiple Trims
- **Identify all available trims** for the most recent model year of the vehicle
- **For each trim level of the current model year**:
  - **Check if vehicle record exists** for this specific trim and model year using MCP Supabase tool
  - **If exists**: Update the existing vehicle record with latest information using MCP Supabase tool
  - **If does not exist**: Create a new vehicle record for this trim and model year using MCP Supabase tool
  - **Check if specifications exist** for this vehicle and model year using MCP Supabase tool
  - **If specifications exist**: Update existing specification record with current model year data using MCP Supabase tool
  - **If specifications do not exist**: Create new specification record for the latest model year using MCP Supabase tool
- **Ensure uniqueness** using the constraint: (manufacturer_id, model, trim) where is_currently_available = true
- **Prioritize current model year** over older model years when updating existing records

### 3. News Articles Phase

#### 3.1 Process News Articles
- **For each relevant news article found**:
  - Extract title, summary, source URL, source name
  - Determine appropriate category (Technology, Market Trends, Reviews, Performance, Safety, etc.)
  - Generate relevant tags (vehicle model, manufacturer, technology keywords, year)
  - Set published_date to article publication date or current date if unknown
  - **Quality check**: Ensure articles are recent (within 30 days) and relevant to current model year

#### 3.2 Insert News Articles
- **For each news article found**:
  - **Check if article already exists** in `news_articles` table (by title or source_url) using MCP Supabase tool
  - **If article exists**: Skip or update if newer information is available using MCP Supabase tool
  - **If article does not exist**: Insert new article into `news_articles` table using MCP Supabase tool
- **Include proper categorization** and tagging for easy filtering

### 4. Data Validation and Quality Assurance

#### 4.1 Validate Data Quality
- **Ensure all numerical values are realistic** (e.g., range > 0, power > 0)
- **Verify manufacturer information** is accurate and complete
- **Check for data consistency** across related records

#### 4.2 Handle Edge Cases
- **If vehicle is discontinued**: Set `is_currently_available` to false and note the last available model year
- **If specifications vary by region**: Use US/EPA specifications as primary for the most recent model year
- **If multiple sources conflict**: Use most recent or authoritative source, prioritizing current model year data
- **If model year is unclear**: Research to determine the most recent model year and use that as the reference
- **If vehicle has multiple model years available**: Focus on the latest model year unless specifically requested otherwise

### 5. Response Format

#### 5.1 Success Response
Return a structured response including:
```json
{
  "success": true,
  "message": "Vehicle details updated successfully",
  "data": {
    "manufacturer_created": number,
    "manufacturer_updated": number,
    "vehicles_created": number,
    "vehicles_updated": number,
    "specifications_created": number,
    "specifications_updated": number,
    "news_articles_added": number,
    "news_articles_skipped": number,
    "trims_processed": ["trim1", "trim2", ...],
    "vehicle_ids": ["uuid1", "uuid2", ...],
    "model_year_processed": "2025"
  },
  "timestamp": "ISO timestamp",
  "source": "google-gemini"
}
```

#### 5.2 Error Response
Return error details including:
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error information",
  "timestamp": "ISO timestamp",
  "source": "google-gemini"
}
```

## Implementation Notes

### Database Schema Considerations
- Use the `current_vehicles` view for filtering currently available models
- Respect the unique constraint on (manufacturer_id, model, trim) for current vehicles
- Update `updated_at` timestamps for all modified records

### API Integration
- Use Google Gemini with web search tools for real-time information
- **Use MCP tool** for all database operations in Cursor
- Implement proper error handling for API failures
- Cache results when appropriate to avoid duplicate API calls

### Data Sources Priority
1. **Official manufacturer websites** (highest priority) - focus on current model year information
2. **EPA fuel economy data** for specifications of the most recent model year
3. **Automotive news sources** for news articles about current models
4. **Industry databases** for technical specifications of the latest model year

## Error Handling
- **API failures**: Retry with exponential backoff
- **Database constraints**: Handle unique constraint violations gracefully using MCP Supabase tool
- **Data validation errors**: Log and skip invalid records
- **Network timeouts**: Implement proper timeout handling
- **MCP Supabase tool failures**: Verify MCP configuration and service role key access
- **Row Level Security (RLS) errors**: Use service role key instead of anonymous key for database operations
- **Schema constraint violations**: Ensure both `year` and `model_year` fields are populated for vehicles table
- **Environment variable issues**: Check for proper configuration in `web/.env.local` and `supabase/deploy/.env`

## Security Considerations
- **Validate all input data** before database insertion using MCP Supabase tool
- **Sanitize text content** to prevent injection attacks
- **Use parameterized queries** for database operations via MCP Supabase tool
- **Implement rate limiting** for API calls
- **Ensure MCP Supabase tool** uses service role key for proper authentication

## Testing
- **Test with various vehicle types** (sedans, SUVs, trucks) for the most recent model year
- **Verify data accuracy** against known specifications of current model year
- **Test error scenarios** (invalid vehicles, API failures)
- **Validate database constraints** are properly handled using MCP Supabase tool
- **Ensure model year accuracy** by cross-referencing multiple sources for the latest model year
- **Test MCP Supabase tool integration** to ensure proper database connectivity and operations
- **Test fallback Node.js script method** when MCP tools are unavailable
- **Verify service role key authentication** works properly for database operations
- **Test both `year` and `model_year` field population** to avoid constraint violations

## Implementation Efficiency Tips
- **Batch operations**: Process multiple trims in a single script execution
- **Environment setup**: Pre-configure environment variables to avoid runtime errors
- **Error recovery**: Implement graceful fallback from MCP tools to Node.js script
- **Data validation**: Pre-validate all data before database operations
- **Cleanup**: Remove temporary files and dependencies after successful execution
- **Logging**: Provide detailed progress updates and error messages for debugging

## Execution Best Practices (Based on Successful Runs)
### Proven Success Patterns
- **Tesla Cybertruck (2025)**: Successfully processed 3 trims, 3 specifications, 3 news articles
- **Tesla Model X (2025)**: Successfully processed 2 trims, 2 specifications, 3 news articles

### Key Success Factors
1. **Comprehensive Research**: Use multiple targeted web searches for complete information
2. **Structured Data Organization**: Pre-organize all vehicle data before database operations
3. **Robust Error Handling**: Implement comprehensive try-catch blocks with detailed error reporting
4. **Progress Tracking**: Provide real-time feedback on each operation step
5. **Schema Compliance**: Always set both `year` and `model_year` fields to avoid constraint violations
6. **Service Role Authentication**: Use service role key to bypass RLS policies
7. **Cleanup Discipline**: Remove all temporary files and dependencies after execution

### Execution Time Optimization
- **Research Phase**: 2-3 minutes for comprehensive vehicle and news research
- **Database Operations**: 1-2 minutes for complete vehicle and specification updates
- **Total Execution**: 3-5 minutes for complete vehicle update process
- **Cleanup**: <30 seconds for temporary file removal

## Fallback Implementation Method (Node.js Script)
When MCP Supabase tools are unavailable, create a Node.js script with the following structure:

### Script Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.1"
  }
}
```

### Environment Configuration
- Load `web/.env.local` for `VITE_SUPABASE_URL`
- Load `supabase/deploy/.env` for `SUPABASE_SERVICE_ROLE_KEY`
- Use service role key for database operations (bypasses RLS policies)

### Key Implementation Points
- **Authentication**: Use service role key instead of anonymous key
- **Schema compliance**: Set both `year` and `model_year` fields for vehicles
- **Error handling**: Implement comprehensive error catching and reporting
- **Transaction management**: Handle database operations with proper error recovery
- **Progress tracking**: Provide detailed logging of operations and results
- **Cleanup**: Remove temporary files after successful execution

### Example Script Structure
```javascript
// 1. Environment setup and Supabase client initialization
// 2. Data structure definition with all vehicle information
// 3. Manufacturer update/create logic
// 4. Vehicle and specification processing loop
// 5. News article processing
// 6. Result reporting and cleanup
```

### Proven Script Template
Based on successful executions, use this proven structure:
- **Environment Configuration**: Load both `web/.env.local` and `supabase/deploy/.env`
- **Data Organization**: Structure all vehicle data in a single object with manufacturer, vehicles, and newsArticles arrays
- **Error Handling**: Wrap all operations in try-catch blocks with detailed error reporting
- **Progress Logging**: Provide step-by-step progress updates with emojis for visual clarity
- **Result Tracking**: Maintain comprehensive counters for all operations (created/updated/skipped)
- **Cleanup**: Remove temporary files, package.json, and node_modules after execution

### Success Metrics
- **100% Success Rate**: Both Tesla Cybertruck and Model X updates completed successfully
- **Zero Data Loss**: All specifications and news articles properly stored
- **Complete Coverage**: All available trims processed for each vehicle
- **Efficient Execution**: Average 3-5 minutes total execution time
