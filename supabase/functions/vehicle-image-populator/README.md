# Vehicle Image Populator Edge Function

## Overview
This Supabase Edge Function automatically populates missing vehicle profile images and gallery images using Google Gemini AI web search. It scans the vehicles table, identifies vehicles missing images, searches for appropriate existing images using Gemini's web search capabilities, and stores them in Supabase Storage.

## Features
- **Automatic Detection**: Identifies vehicles missing profile or gallery images
- **AI-Powered Search**: Uses Google Gemini AI web search to find high-quality existing vehicle images
- **Batch Processing**: Processes vehicles in batches to respect API rate limits
- **Comprehensive Storage**: Stores images in Supabase Storage and updates database references
- **Error Handling**: Robust error handling with detailed logging
- **Rate Limiting**: Built-in delays to respect Gemini API rate limits

## Prerequisites
- Supabase project with vehicles table
- Google Gemini API access and API key
- Supabase Storage configured with `vehicle-images` bucket
- Vehicle image storage schema implemented

## Environment Variables
Set the following environment variables in your Supabase project:

```bash
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema Requirements
The function expects the following tables to exist:

### vehicles table
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID REFERENCES manufacturers(id),
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  trim TEXT,
  body_style TEXT,
  is_electric BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  profile_image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### vehicle_images table
```sql
CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  image_name TEXT NOT NULL,
  image_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### manufacturers table
```sql
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Storage Setup
Create a storage bucket named `vehicle-images` in your Supabase project:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true);

-- Set up storage policies (adjust as needed for your security requirements)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');
```

## Usage

### Trigger the Function
Send a POST request to the edge function endpoint:

```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/vehicle-image-populator \
  -H "Authorization: Bearer your_anon_key_or_service_role_key" \
  -H "Content-Type: application/json"
```

### Function Response
The function returns a detailed response with processing results:

```json
{
  "success": true,
  "message": "Vehicle image population process completed successfully",
  "result": {
    "totalVehicles": 25,
    "vehiclesProcessed": 10,
    "vehiclesWithNewImages": 8,
    "totalImagesGenerated": 24,
    "errors": [],
    "timestamp": "2024-12-19T10:30:00.000Z"
  }
}
```

## Configuration
The function includes several configurable parameters in the `CONFIG` object:

```typescript
const CONFIG = {
  IMAGES_PER_VEHICLE: 3,           // Number of gallery images per vehicle
  MAX_CONCURRENT_REQUESTS: 2,      // Max concurrent API requests
  REQUEST_DELAY_MS: 1000,          // Delay between requests (ms)
  STORAGE_BUCKET: 'vehicle-images', // Storage bucket name
  IMAGE_QUALITY: 'high',           // Image quality setting
  MAX_RETRIES: 3                   // Max retry attempts
};
```

## Image Search Prompts
The function uses specialized prompts for different image types:

### Profile Images
- Professional 3/4 front angle shot
- Clean, high-quality composition
- Suitable for vehicle database profiles
- Must be existing, real images (not AI generated)

### Gallery Images
1. **Exterior Shot**: Beautiful exterior view showing vehicle design
2. **Feature Highlight**: Close-up of key features
3. **Lifestyle Shot**: Vehicle in realistic setting
- All images must be existing, real images (not AI generated)

## Rate Limiting
The function implements rate limiting to respect Gemini API limits:
- Processes vehicles in batches of 2
- Adds 1-second delays between requests
- Configurable batch sizes and delays

## Error Handling
The function includes comprehensive error handling:
- Database connection errors
- API rate limiting
- Image processing failures
- Storage upload errors
- Detailed error logging and reporting

## Monitoring and Logging
The function provides detailed logging for monitoring:
- Processing progress updates
- Vehicle-by-vehicle status
- Error details and stack traces
- Performance metrics

## Security Considerations
- Requires valid Bearer token authentication
- Uses service role key for database access
- Validates all input data
- Implements proper CORS headers

## Performance Optimization
- Batch processing to minimize API calls
- Concurrent processing within rate limits
- Efficient database queries with joins
- Optimized image storage paths

## Troubleshooting

### Common Issues
1. **Missing Environment Variables**: Ensure all required env vars are set
2. **Database Connection**: Verify Supabase credentials and network access
3. **Storage Permissions**: Check storage bucket policies and permissions
4. **API Rate Limits**: Monitor Gemini API usage and adjust delays if needed

### Debug Mode
Enable additional logging by setting environment variable:
```bash
DEBUG=true
```

## Development

### Local Testing
Test the function locally using Deno:

```bash
cd supabase/functions/vehicle-image-populator
deno run --allow-net --allow-env --allow-read index.ts
```

### Deployment
Deploy to Supabase using the CLI:

```bash
supabase functions deploy vehicle-image-populator
```

## Future Enhancements
- Image quality optimization and compression
- Support for additional image formats
- Advanced image validation and filtering
- Progress tracking for long-running operations
- Webhook notifications for completion
- Scheduled execution via cron jobs

## Support
For issues or questions:
1. Check the function logs in Supabase dashboard
2. Verify environment variables and permissions
3. Review database schema requirements
4. Check Gemini API quota and limits
