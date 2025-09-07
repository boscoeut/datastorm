# Google Search MCP Server - Deployment Guide

## Prerequisites

Before deploying this edge function, ensure you have:

1. **Google Custom Search API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Custom Search API
   - Create credentials (API Key)
   - Note down your API key

2. **Custom Search Engine ID**
   - Visit [Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/create)
   - Create a new search engine
   - Configure what to search (specific sites or entire web)
   - Copy the Search Engine ID from the Overview page

## Environment Variables

Set these environment variables in your Supabase project:

```bash
# Required
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Optional
GOOGLE_SEARCH_QUOTA_LIMIT=1000
```

### Setting Environment Variables

#### Via Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to Settings → Edge Functions
3. Add the environment variables listed above

#### Via Supabase CLI:
```bash
supabase secrets set GOOGLE_SEARCH_API_KEY=your_api_key_here
supabase secrets set GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

## Deployment

### Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy google-search-mcp
   ```

### Manual Deployment

1. **Zip the function directory**:
   ```bash
   cd supabase/functions
   zip -r google-search-mcp.zip google-search-mcp/
   ```

2. **Upload via Supabase Dashboard**:
   - Go to Edge Functions in your Supabase dashboard
   - Click "Create a new function"
   - Upload the zip file
   - Set the function name to `google-search-mcp`

## Testing Deployment

### 1. Test MCP Protocol

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/google-search-mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "google_search",
      "arguments": {
        "query": "test search",
        "num_results": 3
      }
    }
  }'
```

### 2. Test Direct Search

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/google-search-mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{
    "query": "electric vehicles",
    "num_results": 5
  }'
```

## Monitoring

### View Logs
```bash
supabase functions logs google-search-mcp
```

### Check Function Status
```bash
supabase functions list
```

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Verify `GOOGLE_SEARCH_API_KEY` is set correctly
   - Check that the API key has Custom Search API enabled

2. **"Search engine ID not configured"**
   - Verify `GOOGLE_SEARCH_ENGINE_ID` is set correctly
   - Ensure the search engine is active

3. **"Rate limit exceeded"**
   - Check your Google API quota limits
   - Consider implementing caching for frequently searched terms

4. **"Invalid search parameters"**
   - Verify request format matches the expected schema
   - Check parameter types and required fields

### Debug Mode

Enable detailed logging by checking the function logs:
```bash
supabase functions logs google-search-mcp --follow
```

## Security Considerations

1. **API Key Protection**: Never expose your Google API key in client-side code
2. **Rate Limiting**: The function includes built-in rate limiting
3. **Input Validation**: All inputs are validated and sanitized
4. **CORS**: Configure CORS appropriately for your use case

## Cost Management

- Google Custom Search API has a free tier (100 queries/day)
- Monitor your usage in the Google Cloud Console
- Consider implementing caching for frequently searched terms
- Set up billing alerts to avoid unexpected charges

## Next Steps

After successful deployment:

1. Test the function with various search queries
2. Integrate with your AI applications using the MCP protocol
3. Monitor usage and performance
4. Consider implementing additional features like result caching

