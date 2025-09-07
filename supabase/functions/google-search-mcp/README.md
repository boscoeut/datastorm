# Google Search MCP Server Edge Function

A Supabase Edge Function that implements an MCP (Model Context Protocol) server for Google search functionality using Google's Programmable Search Engine API.

## Overview

This edge function provides a standardized interface for performing web searches through Google's Custom Search API. It supports both MCP protocol requests and direct search requests, making it compatible with various AI systems and applications.

## Features

- **MCP Protocol Support**: Full implementation of the Model Context Protocol for AI tool integration
- **Google Custom Search Integration**: Uses Google's Programmable Search Engine API
- **Rate Limiting**: Built-in rate limiting to prevent API quota exhaustion
- **Flexible Search Parameters**: Support for various search options including site restrictions and language preferences
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Cross-origin resource sharing enabled for web applications

## Setup

### Prerequisites

1. **Google Custom Search API Key**: Get your API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. **Custom Search Engine ID**: Create a Programmable Search Engine at [Google's Control Panel](https://programmablesearchengine.google.com/controlpanel/create)

### Environment Variables

Set the following environment variables in your Supabase project:

```bash
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
GOOGLE_SEARCH_QUOTA_LIMIT=1000  # Optional: Daily quota limit
```

### Creating a Custom Search Engine

1. Visit the [Google Programmable Search Engine Control Panel](https://programmablesearchengine.google.com/controlpanel/create)
2. Enter a name for your search engine
3. In the "What to search?" section, you can:
   - Add specific websites to search
   - Use URL patterns
   - Leave empty to search the entire web
4. Click "Create"
5. Copy the Search Engine ID from the Overview page

## API Usage

### MCP Protocol Requests

The function supports the Model Context Protocol for AI tool integration:

#### Initialize
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "client-name",
      "version": "1.0.0"
    }
  }
}
```

#### List Available Tools
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

#### Call Search Tool
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "google_search",
    "arguments": {
      "query": "electric vehicles 2024",
      "num_results": 10,
      "site_restriction": "tesla.com",
      "language": "en"
    }
  }
}
```

### Direct Search Requests

For direct API calls without MCP protocol:

```json
{
  "query": "electric vehicles 2024",
  "num_results": 10,
  "site_restriction": "tesla.com",
  "language": "en",
  "start_index": 1
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | The search query string |
| `num_results` | number | No | Number of results to return (1-100, default: 10) |
| `site_restriction` | string | No | Restrict search to a specific site (e.g., "example.com") |
| `language` | string | No | Search language preference (e.g., "en", "es", "fr") |
| `start_index` | number | No | Starting index for pagination (default: 1) |

## Response Format

### Successful Search Response
```json
{
  "success": true,
  "results": [
    {
      "title": "Electric Vehicles in 2024: Latest Trends",
      "link": "https://example.com/ev-trends-2024",
      "snippet": "Comprehensive overview of electric vehicle trends...",
      "displayLink": "example.com",
      "formattedUrl": "https://example.com/ev-trends-2024"
    }
  ],
  "totalResults": "1,234,567",
  "searchTime": 0.123,
  "query": "electric vehicles 2024",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "google-search-mcp"
}
```

### Error Response
```json
{
  "success": false,
  "results": [],
  "totalResults": "0",
  "searchTime": 0,
  "query": "invalid query",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "google-search-mcp",
  "error": "Error message describing what went wrong"
}
```

## Rate Limiting

The function implements rate limiting to prevent API quota exhaustion:

- **Per minute**: 60 requests
- **Per hour**: 1000 requests

Rate limits are applied per client IP address. When limits are exceeded, the function returns an error response.

## Error Handling

The function handles various error scenarios:

- **Invalid parameters**: Returns validation errors with specific field information
- **API failures**: Handles Google API errors and quota exceeded scenarios
- **Rate limiting**: Returns appropriate error messages when limits are exceeded
- **Network issues**: Handles connection timeouts and network errors

## Deployment

### Using Supabase CLI

1. Ensure you have the Supabase CLI installed
2. Set your environment variables in the Supabase dashboard
3. Deploy the function:

```bash
supabase functions deploy google-search-mcp
```

### Manual Deployment

1. Zip the function directory
2. Upload through the Supabase dashboard
3. Set environment variables in the dashboard

## Testing

### Local Testing

You can test the function locally using the Supabase CLI:

```bash
supabase functions serve google-search-mcp
```

### Test Requests

#### MCP Protocol Test
```bash
curl -X POST http://localhost:54321/functions/v1/google-search-mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "google_search",
      "arguments": {
        "query": "test search"
      }
    }
  }'
```

#### Direct Search Test
```bash
curl -X POST http://localhost:54321/functions/v1/google-search-mcp \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test search",
    "num_results": 5
  }'
```

## Security Considerations

- **API Key Protection**: Never expose your Google API key in client-side code
- **Rate Limiting**: Built-in rate limiting helps prevent quota exhaustion
- **Input Validation**: All inputs are validated and sanitized
- **CORS**: Configure CORS appropriately for your use case

## Troubleshooting

### Common Issues

1. **"API key not configured"**: Ensure `GOOGLE_SEARCH_API_KEY` is set in environment variables
2. **"Search engine ID not configured"**: Ensure `GOOGLE_SEARCH_ENGINE_ID` is set
3. **"Rate limit exceeded"**: Wait before making more requests or increase quota limits
4. **"Invalid search parameters"**: Check parameter types and required fields

### Debug Mode

Enable debug logging by checking the function logs in the Supabase dashboard.

## Contributing

When contributing to this function:

1. Follow the existing code style and patterns
2. Add appropriate error handling
3. Update documentation for any new features
4. Test thoroughly before submitting changes

## License

This function is part of the Electric Vehicle Data Hub project and follows the same licensing terms.

