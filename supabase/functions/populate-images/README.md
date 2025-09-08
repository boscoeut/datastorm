# Populate Images Edge Function

A Supabase Edge Function that automatically populates vehicle image galleries by searching for and downloading images from Google Search.

## Overview

This edge function provides server-side image population functionality for the Electric Vehicle Data Hub. It searches for vehicle images using the Google Search MCP service, downloads them, and uploads them to the vehicle's image gallery.

## Features

- **Admin-Only Access**: Requires admin privileges to prevent unauthorized usage
- **Google Search Integration**: Uses the existing google-search-mcp edge function
- **Server-Side Downloads**: Handles image downloads on the server to avoid CORS issues
- **Automatic Upload**: Uploads downloaded images to Supabase storage and database
- **Error Handling**: Comprehensive error handling with detailed feedback
- **Rate Limiting**: Built-in protection against abuse

## API

### Endpoint
```
POST /functions/v1/populate-images
```

### Authentication
Requires a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Request Body
```typescript
interface PopulateImagesRequest {
  vehicleId: string        // Required: Vehicle ID to populate images for
  model: string           // Required: Vehicle model name
  trim?: string          // Optional: Vehicle trim level
  manufacturer?: string  // Optional: Vehicle manufacturer
  maxImages?: number     // Optional: Maximum number of images to download (default: 10)
}
```

### Response
```typescript
interface PopulateImagesResponse {
  success: boolean       // Whether the operation was successful
  imagesUploaded: number // Number of images successfully uploaded
  imagesSearched: number // Number of images found in search
  errors: string[]       // Array of error messages
  message: string        // Human-readable result message
}
```

## Usage Example

```javascript
const response = await fetch('/functions/v1/populate-images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    vehicleId: 'vehicle-123',
    model: 'Model 3',
    trim: 'Performance',
    manufacturer: 'Tesla',
    maxImages: 8
  })
})

const result = await response.json()
console.log(result.message) // "Successfully uploaded 6 images (2 failed)"
```

## Error Handling

The function returns detailed error information:

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: User is not an admin
- **400 Bad Request**: Missing required fields or validation errors
- **500 Internal Server Error**: Server-side errors during processing

## Dependencies

- **google-search-mcp**: Edge function for Google Search API integration
- **Supabase Storage**: For storing downloaded images
- **Supabase Database**: For storing image metadata

## Environment Variables

The function uses the following environment variables (automatically provided by Supabase):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations

## Security

- **Admin Verification**: Uses the `is_admin` RPC function to verify admin privileges
- **JWT Validation**: Validates user tokens before processing requests
- **CORS Protection**: Proper CORS headers for web application integration
- **Input Validation**: Validates all input parameters before processing

## Performance

- **Concurrent Processing**: Downloads and uploads images sequentially to avoid overwhelming the system
- **Error Recovery**: Continues processing even if individual images fail
- **Resource Management**: Proper cleanup of temporary resources
