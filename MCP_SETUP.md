# MCP Server Setup Guide

This guide explains how to set up the MCP (Model Context Protocol) servers for the Datastorm project.

## Environment Variables

The MCP servers require environment variables to be set. Follow these steps:

### 1. Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

### 2. Configure Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)
2. Generate a new access token
3. Update the `.env` file with your token:
   ```
   SUPABASE_ACCESS_TOKEN=your_actual_token_here
   ```

### 3. Verify Configuration

The MCP configuration in `.cursor/mcp.json` will automatically load the environment variables from your `.env` file.

## Security Notes

- **Never commit the `.env` file** - it's already in `.gitignore`
- **Keep your access tokens secure** - they provide full access to your Supabase project
- **Use the `.env.example` file** as a template for other developers

## MCP Servers

This project includes three MCP servers:

1. **supabase** - Direct Supabase database access
2. **google-search** - Google Search API integration
3. **datastorm-mcp** - Custom Datastorm functionality (including populate-images via mcp-server)

All servers are configured to use environment variables for secure token management.

## Restarting MCP Servers

After setting up environment variables, you may need to restart the MCP servers:

```bash
# Run the restart script
./restart-mcp.sh

# Or manually restart Cursor to pick up the new configuration
```

## Testing MCP Servers

You can test the MCP servers using the provided test script:

```bash
# Test the datastorm-mcp server
node test-mcp-wrapper.js
```

This script will:
- Load environment variables from `.env`
- Verify the `SUPABASE_ACCESS_TOKEN` is set
- Test the MCP server initialization
- List available tools
- Show server responses

## Troubleshooting

If you encounter authentication errors:
1. Verify your `.env` file exists and contains the correct token
2. Check that the token has the necessary permissions
3. Ensure the token hasn't expired
4. Restart Cursor after making changes to the MCP configuration
5. Run `./restart-mcp.sh` to verify environment variables are loaded correctly
6. Test with `node test-mcp-wrapper.js` to verify the MCP server is working
