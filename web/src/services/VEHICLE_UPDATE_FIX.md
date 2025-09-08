# Vehicle Update Service Fix

## Problem
The admin vehicle update feature was returning a 400 Bad Request error when calling the MCP server. The error was:
```
POST https://duiakhiloobwkgvfrcnl.supabase.co/functions/v1/mcp-server 400 (Bad Request)
```

## Root Cause
The frontend was sending requests in a custom format, but the MCP server expects JSON-RPC format for tool execution.

### Incorrect Format (Before):
```javascript
{
  method: 'update-vehicle-details',
  params: {
    manufacturer: 'GMC',
    model: 'Hummer EV',
    trim: 'EV2X',
    year: 2025
  }
}
```

### Correct Format (After):
```javascript
{
  jsonrpc: '2.0',
  id: '1234567890',
  method: 'tools/call',
  params: {
    name: 'update-vehicle-details',
    arguments: {
      manufacturer: 'GMC',
      model: 'Hummer EV',
      trim: 'EV2X',
      year: 2025
    }
  }
}
```

## Solution

### 1. Updated Request Format
Changed the request format in `vehicle-update.ts` to use proper JSON-RPC format:
- Added `jsonrpc: '2.0'` and unique `id`
- Changed `method` to `'tools/call'`
- Moved tool name to `params.name`
- Moved arguments to `params.arguments`

### 2. Updated Response Parsing
Added proper parsing for JSON-RPC response format:
- Extract result from `data.result.content[0].text`
- Handle JSON-RPC error responses
- Parse the JSON string result back to object

## Code Changes

### Before:
```typescript
const { data, error } = await supabase.functions.invoke('mcp-server', {
  body: {
    method: 'update-vehicle-details',
    params: {
      manufacturer: params.manufacturer,
      model: params.model,
      trim: params.trim,
      year: params.year
    }
  }
});
```

### After:
```typescript
const { data, error } = await supabase.functions.invoke('mcp-server', {
  body: {
    jsonrpc: '2.0',
    id: Date.now().toString(),
    method: 'tools/call',
    params: {
      name: 'update-vehicle-details',
      arguments: {
        manufacturer: params.manufacturer,
        model: params.model,
        trim: params.trim,
        year: params.year
      }
    }
  }
});
```

## Testing
The fix should now allow:
1. ✅ Proper authentication with admin tokens
2. ✅ Correct parameter validation by MCP server
3. ✅ Successful vehicle detail updates
4. ✅ Proper error handling and user feedback

## Expected Behavior
When an admin submits the vehicle update form:
1. Request is sent in proper JSON-RPC format
2. MCP server validates admin permissions
3. MCP server calls the vehicle-updater with Gemini integration
4. AI-powered research extracts vehicle data
5. Database is updated with new vehicle information
6. Detailed results are returned to the admin interface

## Error Handling
The updated service now properly handles:
- JSON-RPC error responses
- Network errors
- Authentication failures
- Parameter validation errors
- MCP server internal errors

All errors are displayed to the user with clear, actionable messages.
