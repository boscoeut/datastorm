# Supabase Edge Functions

This directory contains Edge Functions for the Electric Vehicle Data Hub project.

## Available Functions

### 1. MCP Server (`mcp-server/`)
- **Purpose**: Model Context Protocol server with vehicle and news management tools
- **Endpoint**: `POST /functions/v1/mcp-server`
- **Test Data**: `{}`


## Development and Testing

### Running Functions Locally

#### Option 1: Using the Flexible Script (Recommended)
```bash
# Run mcp-server on port 8000
./run-with-env-explicit.sh mcp-server 8000

# Show usage help
./run-with-env-explicit.sh --help
```

**How it works:** The script dynamically constructs the `deno run` command with the correct function path, making it flexible for any Edge Function.

#### Option 2: Manual Directory Navigation
```bash
cd mcp-server
PORT=8000 deno run --allow-net --allow-env --allow-read --watch index.ts
```

### Testing Functions

#### Option 1: Using the Flexible Test Script
```bash
# Test mcp-server on port 8000
./test-function.sh mcp-server 8000
```

#### Option 2: Manual Testing with curl
```bash
# Test mcp-server
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{}'
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
./run-with-env-explicit.sh mcp-server 8000
```

### 2. Test the Function
```bash
# Terminal 2: Run tests
./test-function.sh mcp-server 8000
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
   - Use a different port: `./run-with-env-explicit.sh mcp-server 9000`
   - Kill existing processes using the port

### Debug Mode
```bash
# Check function logs
cd mcp-server
deno run --allow-net --allow-env --allow-read --watch index.ts

# Or check Supabase logs
supabase functions logs mcp-server
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
supabase functions deploy mcp-server

# Deploy with specific project
supabase functions deploy mcp-server --project-ref your-project-ref
```
