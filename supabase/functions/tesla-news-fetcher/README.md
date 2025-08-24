# Tesla News Fetcher Edge Function

This Supabase Edge Function fetches the latest Tesla news using Google Gemini AI and populates the `news_articles` table with 5-10 daily stories.

## Features

- **AI-Powered News Generation**: Uses Google Gemini AI to generate current Tesla news
- **Automatic Database Population**: Inserts generated news into the `news_articles` table
- **Data Validation**: Comprehensive validation using Zod schemas
- **Error Handling**: Robust error handling for API failures and database errors
- **CORS Support**: Proper CORS configuration for web applications

## Prerequisites

1. **Google Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Supabase Project**: Ensure you have a Supabase project with the `news_articles` table
3. **Environment Variables**: Set up required environment variables

## Environment Variables

Set these environment variables in your Supabase project:

```bash
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Installation

1. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy tesla-news-fetcher
   ```

2. **Set Environment Variables**:
   ```bash
   supabase secrets set GOOGLE_GEMINI_API_KEY=your_key_here
   ```

## Usage

### Invoke the Function

```typescript
// Using fetch
const response = await fetch('/functions/v1/tesla-news-fetcher', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`
  }
});

const result = await response.json();
```

### Using Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

const { data, error } = await supabase.functions.invoke('tesla-news-fetcher', {
  method: 'POST'
})
```

## Response Format

### Success Response

```json
{
  "success": true,
  "articles": [
    {
      "id": "uuid",
      "title": "Tesla Announces New Battery Technology",
      "summary": "Tesla has unveiled a breakthrough battery technology...",
      "category": "Technology",
      "tags": ["tesla", "battery", "technology"],
      "source_name": "Google Gemini AI",
      "published_date": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:00:00Z",
  "source": "google-gemini"
}
```

### Error Response

```json
{
  "success": false,
  "articles": [],
  "count": 0,
  "timestamp": "2024-01-15T10:00:00Z",
  "source": "google-gemini",
  "error": "Error message here"
}
```

## Database Schema

The function populates the `news_articles` table with the following structure:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Auto-generated unique identifier |
| `title` | VARCHAR(500) | News article headline |
| `summary` | VARCHAR(1000) | Brief summary of the article |
| `category` | VARCHAR(100) | News category (e.g., Technology, Industry News) |
| `tags` | TEXT[] | Array of relevant tags |
| `source_name` | VARCHAR(255) | Set to "Google Gemini AI" |
| `published_date` | TIMESTAMP | Current timestamp |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Error Handling

The function handles various error scenarios:

- **Missing API Keys**: Returns error if environment variables are not set
- **Gemini API Failures**: Handles API rate limits and connection issues
- **Database Errors**: Manages insertion failures and validation errors
- **Invalid Data**: Validates all data before database insertion

## Rate Limiting

- **Google Gemini API**: Respects Google's rate limits
- **Database Operations**: Efficient batch insertion
- **Function Execution**: Optimized for performance

## Security

- **Environment Variables**: API keys stored securely
- **Input Validation**: All data validated using Zod schemas
- **CORS Configuration**: Proper cross-origin request handling
- **Authentication**: Uses Supabase service role for database access

## Monitoring

The function includes comprehensive logging:

- API request/response logging
- Database operation logging
- Error logging with stack traces
- Performance metrics

## Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `GOOGLE_GEMINI_API_KEY` is set
2. **Database Connection**: Verify Supabase credentials
3. **Rate Limiting**: Check Google Gemini API quotas
4. **CORS Errors**: Verify CORS configuration in your application

### Debug Mode

Enable debug logging by setting the log level in your Supabase dashboard.

## Contributing

When modifying this function:

1. Follow the existing code structure
2. Maintain type safety with TypeScript
3. Add comprehensive error handling
4. Update tests and documentation
5. Follow the project's coding standards

## License

This function is part of the Electric Vehicle Data Hub project.
