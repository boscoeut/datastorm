# .env File Troubleshooting Guide

This guide helps you resolve common issues with your `.env` file when using the Supabase deployment scripts.

## Common Issues and Solutions

### 1. "unexpected character '\n' in variable name" Error

This error typically occurs when:
- Your API key contains newline characters
- The `.env` file has incorrect line endings
- There are hidden characters in the file

**Solution:**
```bash
# Navigate to the deploy directory
cd supabase/deploy

# Test your .env file format
./test-env.sh

# If issues are found, try to fix them automatically
./test-env.sh --fix

# Or use the main deployment script with the fix option
./deploy.sh --fix-env
```

### 2. Proper .env File Format

Your `.env` file should look like this:
```bash
# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=AIzaSyCbMb5UO5Ye0DlgEtR28NKgcithZp5tGQQ

# Supabase Project URL
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important Rules:**
- No spaces around the `=` sign
- No quotes around simple values (unless they contain spaces)
- Each variable on its own line
- No trailing spaces or newlines
- Use `#` for comments

### 3. Manual Fixes

If automatic fixing doesn't work, try these manual steps:

**Remove hidden characters:**
```bash
# Create a clean version
cat .env | tr -d '\r' | sed 's/\r$//' > .env.clean
mv .env.clean .env
```

**Check file encoding:**
```bash
# Ensure the file is UTF-8 encoded
file .env
```

**Recreate the file:**
```bash
# Backup current file
cp .env .env.backup

# Create new file with proper format
cat > .env << 'EOF'
GOOGLE_GEMINI_API_KEY=your_actual_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
```

### 4. Using the Improved Deployment Script

The updated `deploy.sh` script now includes:

- **Automatic validation** of `.env` file format
- **Better error messages** with specific line numbers
- **Automatic fixing** of common issues with `--fix-env` option
- **Template creation** if no `.env` file exists

**Usage:**
```bash
# Deploy all functions (with automatic validation)
./deploy.sh

# Fix .env file issues
./deploy.sh --fix-env

# Deploy specific function
./deploy.sh mcp-server

# Show help
./deploy.sh --help
```

### 5. Testing Your .env File

Before running the main deployment, test your `.env` file:

```bash
# Navigate to deploy directory
cd supabase/deploy

# Test the format
./test-env.sh

# If issues found, try to fix them
./test-env.sh --fix
```

### 6. Getting Your API Keys

**Google Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (it should look like: `AIzaSyC...`)

**Supabase Credentials:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and Service Role Key

### 7. Security Best Practices

- **Never commit** your `.env` file to version control
- **Use `.gitignore`** to exclude it
- **Keep your API keys secure**
- **Rotate keys regularly** if compromised

### 8. Still Having Issues?

If you continue to have problems:

1. Check the error messages carefully - they now include line numbers
2. Use the `--fix-env` option to attempt automatic repair
3. Validate your file format with `./test-env.sh`
4. Check for hidden characters or encoding issues
5. Ensure your API keys are correct and active

## Example .env File

Here's a complete example of a properly formatted `.env` file:

```bash
# Supabase Configuration
# Replace the placeholder values with your actual credentials

# Google Gemini API Key (get from https://makersuite.google.com/app/apikey)
GOOGLE_GEMINI_API_KEY=AIzaSyCbMb5UO5Ye0DlgEtR28NKgcithZp5tGQQ

# Supabase Project URL (get from your Supabase project dashboard)
SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# Supabase Service Role Key (get from your Supabase project dashboard)
# WARNING: Keep this secret and never commit it to version control
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM5NzQ5NjAwLCJleHAiOjE5NTUzMjU2MDB9.example_signature
```

Remember to replace the placeholder values with your actual credentials!
