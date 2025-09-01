# Gemini Proxy Edge Function

A secure Supabase Edge Function that acts as a proxy to Google's Gemini AI API, allowing frontend applications to execute AI tasks without exposing API keys to the client-side code.

## Features

- 🔒 **Secure API Key Management** - API keys are stored server-side only
- 🛡️ **Request Validation** - Comprehensive input validation using Zod schemas
- ⚡ **Rate Limiting** - Built-in rate limiting to prevent abuse
- 🔍 **Request Logging** - Logs all requests for monitoring and debugging
- 🌐 **CORS Support** - Proper CORS configuration for frontend access
- 🎯 **Task-Based Architecture** - Support for different types of AI tasks
- 📊 **Usage Tracking** - Token usage information from Gemini API

## Security Features

- API key never exposed in responses
- Input validation and sanitization
- Rate limiting (60 requests per minute per client)
- Request size limits (10KB prompt, 1MB data)
- Allowed task whitelist
- IP-based client identification

## API Endpoint

```
POST /functions/v1/gemini-proxy
```

## Request Format

```typescript
interface GeminiProxyRequest {
  task: string;                    // Required: Type of task to execute
  prompt: string;                  // Required: The prompt to send to Gemini
  data?: Record<string, any>;      // Optional: Additional context data
  expectedOutput?: string;         // Optional: Description of expected output format
  model?: string;                  // Optional: Gemini model to use (default: gemini-2.0-flash-exp)
  temperature?: number;            // Optional: Creativity level 0-2 (default: 0.7)
  maxTokens?: number;              // Optional: Max tokens in response (default: 2048)
  tools?: Array<Record<string, any>>; // Optional: Gemini tools (e.g., Google Search)
}
```

## Response Format

```typescript
interface GeminiProxyResponse {
  success: boolean;                // Whether the request was successful
  data?: {                         // Present on success
    text: string;                  // Gemini's response text
    usage?: {                      // Token usage information
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: string;                  // Present on failure
  timestamp: string;               // ISO timestamp
  source: 'google-gemini-proxy';   // Source identifier
}
```

## Allowed Tasks

- `analyze_vehicle_data` - Analyze vehicle specifications and data
- `generate_content` - Generate various types of content
- `summarize_text` - Summarize provided text
- `answer_question` - Answer questions based on context
- `custom_task` - Custom AI tasks

## Usage Examples

### Basic Usage

```javascript
// Frontend usage
const response = await fetch('/functions/v1/gemini-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`
  },
  body: JSON.stringify({
    task: 'answer_question',
    prompt: 'What are the benefits of electric vehicles?',
    temperature: 0.8
  })
});

const result = await response.json();
console.log(result.data.text);
```

### Vehicle Data Analysis

```javascript
const vehicleData = {
  make: 'Tesla',
  model: 'Model 3',
  batteryCapacity: '75 kWh',
  range: '358 miles',
  acceleration: '3.1s 0-60 mph'
};

const response = await fetch('/functions/v1/gemini-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`
  },
  body: JSON.stringify({
    task: 'analyze_vehicle_data',
    prompt: 'Analyze this vehicle data and provide insights about its performance and efficiency.',
    data: vehicleData,
    expectedOutput: 'Provide a structured analysis with sections for Performance, Efficiency, and Recommendations.',
    temperature: 0.5
  })
});
```

### Content Generation with Google Search

```javascript
const response = await fetch('/functions/v1/gemini-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`
  },
  body: JSON.stringify({
    task: 'generate_content',
    prompt: 'Write a brief article about the latest developments in electric vehicle technology.',
    expectedOutput: 'Write a 3-4 paragraph article with an introduction, main content, and conclusion.',
    tools: [{ googleSearch: {} }],
    maxTokens: 1000
  })
});
```

### Structured Output with Expected Format

```javascript
const response = await fetch('/functions/v1/gemini-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`
  },
  body: JSON.stringify({
    task: 'custom_task',
    prompt: 'Compare Tesla Model 3 and Model Y specifications.',
    expectedOutput: 'Provide a comparison table with columns for Model 3, Model Y, and include rows for Price, Range, Acceleration, and Cargo Space.',
    data: {
      model3: { price: '$38,990', range: '272 miles', acceleration: '5.6s', cargo: '19.8 cu ft' },
      modelY: { price: '$43,990', range: '330 miles', acceleration: '5.0s', cargo: '76.2 cu ft' }
    }
  })
});
```

## Error Handling

The function returns appropriate HTTP status codes and error messages:

- `200` - Success
- `400` - Bad Request (validation errors)
- `405` - Method Not Allowed (non-POST requests)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Common Error Responses

```json
{
  "success": false,
  "error": "Validation failed: Task 'invalid_task' is not allowed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "google-gemini-proxy"
}
```

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "google-gemini-proxy"
}
```

## Environment Variables

The following environment variables must be set:

- `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

## Deployment

1. Ensure environment variables are set in your Supabase project
2. Deploy the function using Supabase CLI:

```bash
supabase functions deploy gemini-proxy
```

3. Test the deployment:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/gemini-proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{
    "task": "answer_question",
    "prompt": "Hello, how are you?"
  }'
```

## Rate Limiting

- **Per Minute**: 60 requests per client IP
- **Per Hour**: 1000 requests per client IP
- Rate limits are enforced using client IP addresses
- In production, consider using user IDs or session tokens for more granular control

## Monitoring and Logging

The function logs all requests to the console with the following information:
- Task type
- Prompt (truncated to 1000 characters)
- Response (truncated to 1000 characters)
- Success/failure status
- Error messages (if any)
- Timestamp
- Client identifier

## Security Considerations

1. **API Key Protection**: The Gemini API key is never exposed in responses
2. **Input Validation**: All inputs are validated and sanitized
3. **Rate Limiting**: Prevents abuse and excessive API usage
4. **Task Whitelist**: Only predefined tasks are allowed
5. **Size Limits**: Prevents large payload attacks
6. **CORS**: Properly configured for frontend access

## Performance

- Response times typically under 5 seconds
- Supports concurrent requests
- Automatic retry logic for transient failures
- Efficient memory usage with request cleanup

## Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `GOOGLE_GEMINI_API_KEY` is set
2. **Invalid Task**: Check that the task is in the allowed list
3. **Rate Limit**: Wait before making additional requests
4. **Large Payload**: Reduce prompt or data size
5. **CORS Issues**: Ensure proper CORS headers are set

### Debug Mode

Enable debug logging by checking the function logs in the Supabase dashboard or using:

```bash
supabase functions logs gemini-proxy
```

## Contributing

When modifying this function:

1. Update the allowed tasks list in `SECURITY_CONFIG`
2. Test with various input scenarios
3. Verify rate limiting still works correctly
4. Update this documentation
5. Test deployment in a staging environment first
