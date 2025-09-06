# Update Vehicle Details Command

## Overview
This command instructs an agent to take a vehicle provided by the user and perform comprehensive updates including internet research, database updates, and news article collection.

## Prerequisites
- Access to Google Gemini API with web search capabilities
- Supabase database access with service role key
- Understanding of the database schema (vehicles, vehicle_specifications, news_articles tables)

## Input Requirements
The agent should receive:
- **Vehicle identifier**: Manufacturer name and model (e.g., "Tesla Model 3", "Ford F-150 Lightning")
- **Optional**: Specific trim level, year, or other details if provided by user

## Step-by-Step Instructions

### 1. Internet Research Phase

#### 1.1 Search for Vehicle Information
- Use Google Gemini with web search to gather comprehensive information about the vehicle
- Search for:
  - Current model year and available trims
  - Technical specifications (battery capacity, range, power, etc.)
  - Pricing information (MSRP, current market prices)
  - Physical dimensions and features
  - Availability status and production information

#### 1.2 Search for News Articles
- Search for recent news articles (last 30 days) about the specific vehicle
- Look for:
  - New model announcements or updates
  - Price changes or incentives
  - Production updates or delays
  - Reviews or comparisons
  - Regulatory news or recalls
  - Technology updates or features

### 2. Database Update Phase

#### 2.0 Update vs Create Logic
**CRITICAL**: Always follow this pattern for all database operations:
1. **Check if record exists** using appropriate unique identifiers
2. **If record exists**: Update the existing record with new information
3. **If record does not exist**: Create a new record
4. **Never create duplicates** - always update existing records when found

#### 2.1 Update Vehicles Table
- **Check if manufacturer exists** in the `manufacturers` table
  - If not, create new manufacturer record with name, country, website
  - If exists, use existing manufacturer_id
- **Check if vehicle exists** in the `vehicles` table
  - Look for existing records with same manufacturer_id, model, and trim
  - **If vehicle exists**: Update the existing record with new information
  - **If vehicle does not exist**: Create a new vehicle record
- **Key fields to update/create**:
  - `model`: Vehicle model name
  - `model_year`: Current model year (for reference)
  - `trim`: Trim level (if specified)
  - `body_style`: Vehicle body style (Sedan, SUV, Truck, etc.)
  - `is_electric`: Set to true for electric vehicles
  - `is_currently_available`: Set to true if currently in production/available
  - `updated_at`: Current timestamp

#### 2.2 Update Vehicle Specifications Table
- **For each trim level found**, handle specifications in `vehicle_specifications` table
  - **If specifications exist for the vehicle**: Update the existing specification record
  - **If specifications do not exist**: Create a new specification record
- **Key specifications to include**:
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

#### 2.3 Handle Multiple Trims
- **Identify all available trims** for the vehicle model
- **For each trim level**:
  - **Check if vehicle record exists** for this specific trim
  - **If exists**: Update the existing vehicle record
  - **If does not exist**: Create a new vehicle record for this trim
  - **Check if specifications exist** for this vehicle
  - **If specifications exist**: Update existing specification record
  - **If specifications do not exist**: Create new specification record
- **Ensure uniqueness** using the constraint: (manufacturer_id, model, trim) where is_currently_available = true

### 3. News Articles Phase

#### 3.1 Process News Articles
- **For each relevant news article found**:
  - Extract title, summary, source URL, source name
  - Determine appropriate category (Technology, Market Trends, Reviews, etc.)
  - Generate relevant tags (vehicle model, manufacturer, technology keywords)
  - Set published_date to article publication date or current date if unknown

#### 3.2 Insert News Articles
- **For each news article found**:
  - **Check if article already exists** in `news_articles` table (by title or source_url)
  - **If article exists**: Skip or update if newer information is available
  - **If article does not exist**: Insert new article into `news_articles` table
- **Include proper categorization** and tagging for easy filtering

### 4. Data Validation and Quality Assurance

#### 4.1 Validate Data Quality
- **Ensure all numerical values are realistic** (e.g., range > 0, power > 0)
- **Verify manufacturer information** is accurate and complete
- **Check for data consistency** across related records

#### 4.2 Handle Edge Cases
- **If vehicle is discontinued**: Set `is_currently_available` to false
- **If specifications vary by region**: Use US/EPA specifications as primary
- **If multiple sources conflict**: Use most recent or authoritative source

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
    "vehicle_ids": ["uuid1", "uuid2", ...]
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
- Implement proper error handling for API failures
- Cache results when appropriate to avoid duplicate API calls

### Data Sources Priority
1. **Official manufacturer websites** (highest priority)
2. **EPA fuel economy data** for specifications
3. **Automotive news sources** for news articles
4. **Industry databases** for technical specifications

## Error Handling
- **API failures**: Retry with exponential backoff
- **Database constraints**: Handle unique constraint violations gracefully
- **Data validation errors**: Log and skip invalid records
- **Network timeouts**: Implement proper timeout handling

## Security Considerations
- **Validate all input data** before database insertion
- **Sanitize text content** to prevent injection attacks
- **Use parameterized queries** for database operations
- **Implement rate limiting** for API calls

## Testing
- **Test with various vehicle types** (sedans, SUVs, trucks)
- **Verify data accuracy** against known specifications
- **Test error scenarios** (invalid vehicles, API failures)
- **Validate database constraints** are properly handled
