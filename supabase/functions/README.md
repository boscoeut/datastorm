# Supabase Edge Functions

This directory contains Edge Functions for the Electric Vehicle Data Hub project.

## Available Functions

### 1. Tesla News Fetcher (`tesla-news-fetcher/`)
- **Purpose**: Fetches Tesla news using Google Gemini AI
- **Endpoint**: `POST /functions/v1/tesla-news-fetcher`
- **Test Data**: `{}`

### 2. Vehicle Database Populator (`vehicle-database-populator/`)
- **Purpose**: Populates vehicles database with EV data using Google Gemini AI
- **Endpoint**: `POST /functions/v1/vehicle-database-populator`
- **Test Data**: `{"action": "populate"}`

## Development and Testing

### Running Functions Locally

#### Option 1: Using the Flexible Script (Recommended)
```bash
# Run tesla-news-fetcher on default port 8000
./run-with-env-explicit.sh

# Run vehicle-database-populator on default port 8000
./run-with-env-explicit.sh vehicle-database-populator

# Run on custom port
./run-with-env-explicit.sh vehicle-database-populator 9000

# Show usage help
./run-with-env-explicit.sh --help
```

**How it works:** The script dynamically constructs the `deno run` command with the correct function path, making it flexible for any Edge Function.

#### Option 2: Manual Directory Navigation
```bash
cd tesla-news-fetcher
PORT=8000 deno task dev

# Or for vehicle database populator
cd vehicle-database-populator
PORT=9000 deno task dev
```

#### Option 3: Using Deno Tasks (Alternative)
```bash
# Run tesla-news-fetcher using predefined task
PORT=8000 deno task dev:tesla

# Run vehicle-database-populator using predefined task
PORT=9000 deno task dev:vehicle
```

### Testing Functions

#### Option 1: Using the Flexible Test Script
```bash
# Test tesla-news-fetcher on port 8000
./test-function.sh

# Test vehicle-database-populator on port 8000
./test-function.sh vehicle-database-populator

# Test on custom port
./test-function.sh vehicle-database-populator 9000

# Test with custom data
./test-function.sh vehicle-database-populator 8000 '{"action":"populate","limit":5}'
```

#### Option 2: Using Specialized Test Scripts
```bash
# Test vehicle database populator with comprehensive tests
./test-vehicle-populator.sh 8000

# Test on custom port
./test-vehicle-populator.sh 9000
```

#### Option 3: Manual Testing with curl
```bash
# Test tesla-news-fetcher
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{}'

# Test vehicle-database-populator
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{"action": "populate"}'
```

## Environment Setup

### Required Environment Variables
Create a `.env.local` file in the `supabase/functions/` directory:

```bash
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Environment Variable Loading
The scripts automatically load environment variables from `.env.local` and validate that all required variables are present.

## Script Features

### `run-with-env-explicit.sh`
- ✅ **Flexible Function Selection**: Run any Edge Function by name
- ✅ **Port Customization**: Specify custom ports for development
- ✅ **Environment Validation**: Ensures all required variables are set
- ✅ **Directory Validation**: Checks if function directory exists
- ✅ **Usage Help**: Built-in help and examples

### `test-function.sh`
- ✅ **Flexible Testing**: Test any Edge Function
- ✅ **Port Flexibility**: Works with any port
- ✅ **Custom Test Data**: Send specific JSON payloads
- ✅ **Usage Help**: Built-in help and examples

### `test-vehicle-populator.sh`
- ✅ **Comprehensive Testing**: Multiple test scenarios
- ✅ **Error Handling**: Tests various edge cases
- ✅ **Validation**: Checks if function is accessible
- ✅ **Detailed Output**: Clear test results and tips

## Development Workflow

### 1. Start Development
```bash
# Terminal 1: Start the function
./run-with-env-explicit.sh vehicle-database-populator 8000
```

### 2. Test the Function
```bash
# Terminal 2: Run comprehensive tests
./test-vehicle-populator.sh 8000

# Or run specific tests
./test-function.sh vehicle-database-populator 8000 '{"action":"populate"}'
```

### 3. Monitor and Debug
- Check function logs in the first terminal
- Use the test scripts to verify functionality
- Check database for created records

## Troubleshooting

### Common Issues

1. **Function Not Accessible**
   - Ensure the function is running with `./run-with-env-explicit.sh`
   - Check the port number matches between run and test scripts

2. **Environment Variables Missing**
   - Verify `.env.local` file exists and contains all required variables
   - Check the script output for environment variable validation

3. **Function Directory Not Found**
   - Ensure you're in the `supabase/functions/` directory
   - Check function directory names match exactly

4. **Port Already in Use**
   - Use a different port: `./run-with-env-explicit.sh vehicle-database-populator 9000`
   - Kill existing processes using the port

### Debug Mode
```bash
# Check function logs
cd vehicle-database-populator
deno task dev

# Or check Supabase logs
supabase functions logs vehicle-database-populator
```

## Best Practices

1. **Use Different Ports**: Run different functions on different ports during development
2. **Test Before Deploy**: Always test locally before deploying to production
3. **Check Logs**: Monitor function logs for errors and debugging information
4. **Validate Data**: Use the test scripts to verify function behavior
5. **Environment Isolation**: Keep development and production environment variables separate

## Deployment

```bash
# Deploy to Supabase
supabase functions deploy vehicle-database-populator

# Deploy with specific project
supabase functions deploy vehicle-database-populator --project-ref your-project-ref
```
