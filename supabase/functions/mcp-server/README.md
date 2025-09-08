# MCP Server Edge Function

A Supabase Edge Function that implements a Model Context Protocol (MCP) server for the Electric Vehicle Data Hub, providing access to vehicle image population functionality through the MCP protocol.

## Overview

This edge function provides an MCP-compliant server that exposes the populate-images functionality as a discoverable and executable tool. It follows the MCP JSON-RPC 2.0 protocol standards and integrates seamlessly with MCP clients and AI systems.

## Features

- **MCP Protocol Compliance**: Full implementation of MCP JSON-RPC 2.0 protocol
- **Tool Discovery**: Exposes available tools through MCP tool listing
- **Admin-Only Access**: Requires admin privileges for populate-images tool
- **Google Search Integration**: Built-in Google Search API integration
- **Server-Side Processing**: Handles image downloads and uploads on the server
- **Comprehensive Error Handling**: MCP-compliant error responses
- **Authentication**: JWT token validation and user verification

## MCP Protocol Support

### Supported Methods

- `initialize` - Initialize the MCP server connection
- `tools/list` - List available tools
- `tools/call` - Execute a specific tool

### Available Tools

#### populate-images
Populates vehicle image galleries by searching for and downloading images from Google Search.

**Parameters:**
- `vehicleId` (string, required) - Vehicle ID to populate images for
- `model` (string, required) - Vehicle model name
- `trim` (string, optional) - Vehicle trim level
- `manufacturer` (string, optional) - Vehicle manufacturer
- `maxImages` (number, optional) - Maximum number of images to download (default: 8, max: 20)

## API

### Endpoint
```
POST /functions/v1/mcp-server
```

### Authentication
Requires a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Request Format
All requests must follow JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "populate-images",
    "arguments": {
      "vehicleId": "vehicle-123",
      "model": "Model 3",
      "trim": "Performance",
      "manufacturer": "Tesla",
      "maxImages": 8
    }
  }
}
```

### Response Format
All responses follow JSON-RPC 2.0 format:

**Success Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\": true, \"imagesUploaded\": 6, \"message\": \"Successfully uploaded 6 images for Model 3\"}"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "Access denied",
    "data": "Admin privileges required. Only administrators can populate vehicle images."
  }
}
```

## Usage Examples

### Initialize MCP Server
```javascript
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'example-client',
      version: '1.0.0'
    }
  }
}

const response = await fetch('/functions/v1/mcp-server', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(initRequest)
})
```

### List Available Tools
```javascript
const listRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list'
}

const response = await fetch('/functions/v1/mcp-server', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(listRequest)
})
```

### Execute populate-images Tool
```javascript
const toolRequest = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'populate-images',
    arguments: {
      vehicleId: 'vehicle-123',
      model: 'Model 3',
      trim: 'Performance',
      manufacturer: 'Tesla',
      maxImages: 8
    }
  }
}

const response = await fetch('/functions/v1/mcp-server', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(toolRequest)
})
```

## Error Codes

The MCP server uses standard JSON-RPC 2.0 error codes:

- `-32600` - Invalid Request (malformed JSON-RPC)
- `-32601` - Method not found (unsupported MCP method)
- `-32602` - Invalid params (missing required parameters)
- `-32603` - Internal error (server-side processing error)
- `-32000` - Server error (authentication, authorization, or business logic errors)

## Dependencies

- **Google Search API**: Direct integration with Google's Programmable Search Engine
- **Supabase Storage**: For storing downloaded images
- **Supabase Database**: For storing image metadata
- **Deno Runtime**: For edge function execution

## Environment Variables

The function uses the following environment variables (automatically provided by Supabase):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations

## Security

- **Admin Verification**: Uses the `is_admin` RPC function to verify admin privileges
- **JWT Validation**: Validates user tokens before processing requests
- **CORS Protection**: Proper CORS headers for web application integration
- **Input Validation**: Validates all input parameters before processing
- **Rate Limiting**: Built-in protection against abuse through MCP protocol

## Performance

- **Concurrent Processing**: Downloads and uploads images sequentially to avoid overwhelming the system
- **Error Recovery**: Continues processing even if individual images fail
- **Resource Management**: Proper cleanup of temporary resources
- **MCP Protocol Efficiency**: Optimized for MCP client interactions

## Integration with MCP Clients

This server is designed to work with MCP-compatible clients, including:

- Claude Desktop with MCP support
- Custom MCP client applications
- AI systems that support MCP protocol
- Development tools with MCP integration

## Testing

The MCP server can be tested using standard MCP client tools or by sending JSON-RPC 2.0 requests directly to the endpoint. Ensure you have:

1. Valid JWT token with admin privileges
2. Proper JSON-RPC 2.0 request format
3. Required parameters for tool execution

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure JWT token is valid and user has admin privileges
2. **Method Not Found**: Verify request follows JSON-RPC 2.0 format
3. **Invalid Params**: Check that all required parameters are provided
4. **Google Search Errors**: Ensure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID are configured

### Debug Information

The server provides comprehensive logging for debugging:
- Request/response logging
- Authentication status
- Tool execution progress
- Error details and stack traces
