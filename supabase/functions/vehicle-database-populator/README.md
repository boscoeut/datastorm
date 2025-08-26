# Vehicle Database Populator Edge Function

## Overview

The Vehicle Database Populator is a Supabase Edge Function that automatically populates the Electric Vehicle Data Hub database with comprehensive electric vehicle data using Google's Gemini AI API. This function fetches detailed information about electric vehicles sold in the United States and inserts it into the appropriate database tables.

## Features

- **AI-Powered Data Generation**: Uses Google Gemini AI to generate realistic and comprehensive vehicle data
- **Comprehensive Vehicle Information**: Includes manufacturer details, vehicle specifications, and technical data
- **Database Integration**: Automatically populates manufacturers, vehicles, and vehicle_specifications tables
- **Duplicate Prevention**: Intelligently checks for existing vehicles to prevent duplicates
- **Data Validation**: Uses Zod schemas to ensure data quality and consistency
- **Error Handling**: Robust error handling with detailed logging and graceful fallbacks
- **CORS Support**: Full CORS support for web application integration

## Data Structure

The function populates three main database tables:

### Manufacturers Table
- `name`: Manufacturer name (e.g., "Tesla", "Ford")
- `country`: Country of origin
- `website`: Official website URL
- `logo_url`: Logo image URL (optional)
- `created_at` / `updated_at`: Timestamps

### Vehicles Table
- `manufacturer_id`: Reference to manufacturer
- `model`: Vehicle model name
- `year`: Model year
- `trim`: Trim level (optional)
- `body_style`: Body style (SUV, Sedan, etc.)
- `is_electric`: Boolean flag (always true)
- `created_at` / `updated_at`: Timestamps

### Vehicle Specifications Table
- `vehicle_id`: Reference to vehicle
- `battery_capacity_kwh`: Battery capacity in kilowatt-hours
- `range_miles`: EPA estimated range in miles
- `power_hp`: Power output in horsepower
- `torque_lb_ft`: Torque in pound-feet
- `acceleration_0_60`: 0-60 mph acceleration time
- `top_speed_mph`: Top speed in miles per hour
- `weight_lbs`: Vehicle weight in pounds
- `length_inches` / `width_inches` / `height_inches`: Dimensions
- `cargo_capacity_cu_ft`: Cargo capacity in cubic feet
- `seating_capacity`: Number of seats
- `created_at` / `updated_at`: Timestamps

## API Usage

### Endpoint
```
POST /functions/v1/vehicle-database-populator
```

### Request Body
```json
{
  "action": "populate",
  "limit": 50
}
```

### Response Format
```json
{
  "success": true,
  "message": "Successfully processed 15 vehicles. Created 12 new vehicles, skipped 3 duplicates.",
  "data": {
    "manufacturers_created": 10,
    "vehicles_created": 12,
    "specifications_created": 12,
    "total_processed": 15,
    "duplicates_skipped": 3,
    "vehicles": [...]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "google-gemini"
}
```

## Environment Variables

The following environment variables must be set:

- `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Deployment

### Prerequisites
1. Supabase CLI installed and configured
2. Google Gemini API key
3. Access to Supabase project

### Deploy Command
```bash
supabase functions deploy vehicle-database-populator
```

### Test Deployment
```bash
# Test with curl
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/vehicle-database-populator \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"action": "populate"}'
```

## How It Works

1. **Data Generation**: The function sends a detailed prompt to Google Gemini AI requesting comprehensive electric vehicle data
2. **Data Validation**: Received data is validated using Zod schemas to ensure quality and consistency
3. **Manufacturer Handling**: For each vehicle, the function checks if the manufacturer exists or creates a new one
4. **Duplicate Prevention**: The function checks for existing vehicles using manufacturer, model, year, and trim combination
5. **Vehicle Creation**: Only new vehicles are created; existing ones are skipped to prevent duplicates
6. **Specification Insertion**: Specifications are only inserted for new vehicles
7. **Response**: A comprehensive response is returned with counts, including duplicate detection statistics

## Gemini AI Prompt

The function uses a carefully crafted prompt that requests:
- 10-15 diverse electric vehicles from different manufacturers
- Popular models available in the US market
- Realistic and accurate numerical values
- Coverage of major brands (Tesla, Ford, Chevrolet, Hyundai, Kia, Volkswagen, BMW, Mercedes, Audi, Rivian, Lucid)
- Various body styles (sedans, SUVs, trucks, hatchbacks)
- Both luxury and mainstream vehicles
- Recent model years (2020-2025)

## Duplicate Prevention

The function implements intelligent duplicate detection to prevent data duplication:

- **Vehicle Uniqueness**: Checks for existing vehicles using manufacturer + model + year + trim combination
- **Manufacturer Reuse**: Reuses existing manufacturers instead of creating duplicates
- **Smart Counting**: Tracks both new creations and duplicate skips
- **Efficient Processing**: Skips specification insertion for existing vehicles
- **Detailed Reporting**: Provides counts of processed, created, and skipped items

## Error Handling

The function implements comprehensive error handling:
- Individual vehicle processing failures don't stop the entire operation
- Detailed error logging for debugging
- Graceful fallbacks for missing or invalid data
- HTTP status codes that accurately reflect operation results

## Performance Considerations

- **Batch Processing**: Processes multiple vehicles in a single request
- **Efficient Database Operations**: Uses Supabase's optimized client
- **Timeout Handling**: Designed to work within Edge Function time limits
- **Memory Management**: Efficient data structures and cleanup

## Security

- **Service Role Key**: Uses Supabase service role for database operations
- **Input Validation**: All inputs are validated using Zod schemas
- **CORS Configuration**: Proper CORS headers for web application security
- **Error Sanitization**: Error messages don't expose sensitive information

## Monitoring and Logging

- **Console Logging**: Detailed logging for debugging and monitoring
- **Error Tracking**: Comprehensive error tracking and reporting
- **Performance Metrics**: Tracks insertion counts and success rates
- **Timestamp Tracking**: All operations include timestamps for audit trails

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all required environment variables are set
2. **Gemini API Limits**: Check your Gemini API quota and rate limits
3. **Database Permissions**: Verify the service role key has necessary permissions
4. **Schema Mismatches**: Ensure database schema matches the expected structure

### Debug Mode

Enable additional logging by checking the Edge Function logs:
```bash
supabase functions logs vehicle-database-populator
```

## Contributing

When modifying this function:
1. Maintain the existing error handling patterns
2. Update Zod schemas if data structure changes
3. Test thoroughly with various data scenarios
4. Update this README for any API changes

## License

This function is part of the Electric Vehicle Data Hub project and follows the project's licensing terms.
