# Supabase Functions Deployment

This directory contains automated deployment scripts for your Supabase Edge Functions.

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./setup.sh
```

### Option 2: Manual Setup
1. **Copy the environment template**:
   ```bash
   cp env.template .env
   ```

2. **Fill in your environment variables** in the `.env` file

3. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

## Prerequisites

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link your project (if not already linked)
```bash
supabase link --project-ref your-project-ref
```

## Environment Variables

Create a `.env` file in this directory with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GEMINI_API_KEY` | Your Google Gemini AI API key | ✅ Yes |
| `SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ✅ Yes |

### Getting Your API Keys

#### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

#### Supabase Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the **Project URL** and **service_role key**

## Usage

### Deploy All Functions
```bash
./deploy.sh
```

### Deploy Specific Function
```bash
./deploy.sh mcp-server
```

### Show Help
```bash
./deploy.sh --help
```

### Verbose Output
```bash
./deploy.sh --verbose
```

## What the Script Does

1. **Prerequisites Check**:
   - Verifies Supabase CLI is installed
   - Checks if you're authenticated with Supabase

2. **Environment Setup**:
   - Loads variables from `.env` file
   - Validates required environment variables
   - Prompts for missing variables if needed

3. **Function Deployment**:
   - Automatically discovers all functions in the `functions/` directory
   - Deploys each function using `supabase functions deploy`
   - Sets required secrets for each function

4. **Post-Deployment**:
   - Sets environment variables as secrets for each function
   - Provides deployment summary
   - Reports any failures

## Directory Structure

```
supabase/
├── deploy/
│   ├── deploy.sh          # Main deployment script
│   ├── setup.sh           # Automated environment setup script
│   ├── env.template       # Environment variables template
│   └── README.md          # This file
├── functions/
│   └── mcp-server/
│       └── index.ts       # MCP Server Edge Function
│       └── README.md      # Function documentation
└── ...
```

## Troubleshooting

### Common Issues

#### 1. "Supabase CLI not found"
```bash
npm install -g supabase
```

#### 2. "Not logged in to Supabase"
```bash
supabase login
```

#### 3. "Environment variables not set"
- Copy `env.template` to `.env`
- Fill in your actual values
- Ensure no spaces around the `=` sign

#### 4. "Function deployment failed"
- Check your Supabase project status
- Verify your service role key has proper permissions
- Check the function logs in Supabase dashboard

#### 5. "Permission denied" when running script
```bash
chmod +x deploy.sh
```

### Getting Help

1. **Check Supabase Status**:
   ```bash
   supabase status
   ```

2. **View Function Logs**:
   ```bash
   supabase functions logs mcp-server
   ```

3. **Test Function Locally**:
   ```bash
   supabase functions serve mcp-server
   ```

## Security Notes

- **Never commit your `.env` file** to version control
- **Keep your service role key secure** - it has full database access
- **Use environment-specific keys** for development vs production
- **Rotate API keys regularly** for security

## Advanced Usage

### Custom Deployment Options

You can modify the script to:
- Deploy to different environments (dev, staging, prod)
- Add custom validation rules
- Integrate with CI/CD pipelines
- Add rollback functionality

### CI/CD Integration

For automated deployments, you can:
- Set environment variables in your CI/CD platform
- Run the script as part of your build process
- Add deployment notifications
- Implement deployment approvals

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check function logs in Supabase dashboard
4. Verify your environment variables are correct

---

**Note**: This deployment script is designed for the Electric Vehicle Data Hub project and may need modifications for other projects.
