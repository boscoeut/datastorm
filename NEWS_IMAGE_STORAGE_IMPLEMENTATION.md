# News Image Storage Implementation

## Overview
This implementation provides a complete solution for downloading, storing, and displaying images for news articles in the Electric Vehicle Data Hub. It addresses CORS issues and broken image links by downloading images to our own Supabase storage and serving them from there.

## Problem Solved
- **CORS Issues**: External image URLs often block cross-origin requests
- **Broken Links**: External images can be removed or taken down
- **Performance**: Local images load faster and more reliably
- **Control**: We have full control over image availability and optimization

## Architecture

### Database Schema
```sql
-- Additional columns added to news_articles table
ALTER TABLE news_articles 
ADD COLUMN image_url VARCHAR(500),        -- Original external URL
ADD COLUMN image_path VARCHAR(500),       -- Local storage path
ADD COLUMN image_name VARCHAR(255),       -- Stored filename
ADD COLUMN image_size INTEGER,            -- File size in bytes
ADD COLUMN image_width INTEGER,           -- Image width in pixels
ADD COLUMN image_height INTEGER;          -- Image height in pixels
```

### Storage Structure
```
news-images/
├── articles/
│   ├── {article_id}/
│   │   ├── {timestamp}_{sanitized_title}.jpg
│   │   └── {timestamp}_{sanitized_title}.png
```

## Components

### 1. Backend (news-fetcher.ts)
- **Image Search**: Uses Google Search API to find relevant images
- **Image Download**: Downloads images with proper validation and error handling
- **Image Storage**: Uploads images to Supabase storage bucket
- **Database Update**: Updates article records with local image information

### 2. Frontend Services (news-image-storage.ts)
- **NewsImageService**: Manages image operations for news articles
- **Image URL Resolution**: Prioritizes local images over external URLs
- **Storage Management**: Handles image upload, deletion, and metadata

### 3. UI Components (NewsFeed.tsx)
- **Image Display**: Shows images with proper fallbacks
- **Error Handling**: Gracefully handles broken or missing images
- **Responsive Design**: Images adapt to different screen sizes

## Features

### Image Download & Storage
- Downloads images from external URLs
- Validates image format and size
- Stores images in organized folder structure
- Updates database with local image references

### Image Validation
- **Format Validation**: Only allows JPEG, PNG, WebP
- **Size Validation**: Maximum 5MB file size
- **URL Validation**: Ensures valid HTTP/HTTPS URLs
- **Timeout Protection**: 30-second download timeout
- **Content Type Verification**: Validates MIME types

### Error Handling
- **Download Failures**: Graceful fallback to placeholder
- **Storage Errors**: Logs errors without breaking article processing
- **Invalid Images**: Skips problematic images
- **Network Issues**: Timeout and retry logic

### UI Features
- **Responsive Images**: Adapts to mobile and desktop layouts
- **Placeholder Icons**: Shows newspaper icon for articles without images
- **Error Fallbacks**: Hides broken images and shows placeholders
- **Loading States**: Proper loading indicators

## Usage

### Automatic Image Processing
When news articles are fetched via the MCP server:
1. Articles are processed through Gemini AI
2. External image URLs are found via Google Search
3. Images are automatically downloaded and stored
4. Database is updated with local image references
5. UI displays images from local storage

### Manual Image Management
```typescript
import { NewsImageService } from '@/services/news-image-storage'

// Download and store an image
const result = await NewsImageService.downloadAndStoreImage(
  'https://example.com/image.jpg',
  'article-id',
  'Article Title'
)

// Get image URL (prioritizes local storage)
const imageUrl = NewsImageService.getImageUrl(article)

// Delete an image
await NewsImageService.deleteArticleImage(articleId, imagePath)
```

## Configuration

### Environment Variables
- `GOOGLE_SEARCH_API_KEY`: For image search functionality
- `GOOGLE_SEARCH_ENGINE_ID`: Custom search engine ID
- `GOOGLE_GEMINI_API_KEY`: For AI-powered image extraction

### Storage Bucket
- **Bucket Name**: `news-images`
- **Public Access**: Enabled for image serving
- **File Size Limit**: 5MB
- **Allowed Types**: image/jpeg, image/png, image/webp

## Database Migration
Run the migration to add image storage columns:
```sql
\i database/migrations/008_add_image_url_to_news_articles.sql
```

## Storage Initialization
The system automatically initializes the storage bucket when the app starts:
```typescript
import { initializeStorage } from '@/lib/storage-init'

// Initialize all storage buckets
await initializeStorage()
```

## Performance Considerations

### Image Optimization
- Images are stored in their original format
- No automatic compression (can be added later)
- Proper caching headers (3600 seconds)

### Storage Efficiency
- Organized folder structure prevents conflicts
- Timestamped filenames ensure uniqueness
- Upsert functionality prevents duplicates

### Error Recovery
- Failed downloads don't break article processing
- Graceful fallbacks maintain UI functionality
- Comprehensive logging for debugging

## Security

### Input Validation
- URL validation prevents malicious inputs
- File type validation ensures only images
- Size limits prevent abuse

### Storage Security
- Public bucket for image serving
- No sensitive data in image storage
- Proper access controls via Supabase

## Monitoring

### Logging
- Download attempts and results
- Storage upload success/failure
- Error details for debugging

### Metrics
- Images downloaded per article
- Storage usage per article
- Error rates and types

## Future Enhancements

### Image Processing
- Automatic image compression
- Multiple image sizes (thumbnails, full-size)
- Image format conversion (WebP optimization)

### Caching
- CDN integration for global image delivery
- Browser caching optimization
- Image preloading for better UX

### Analytics
- Image load success rates
- User engagement with images
- Storage usage analytics

## Troubleshooting

### Common Issues
1. **Images not displaying**: Check storage bucket permissions
2. **Download failures**: Verify external URLs are accessible
3. **Storage errors**: Check Supabase storage configuration
4. **CORS issues**: Should be resolved with local storage

### Debug Steps
1. Check browser console for image loading errors
2. Verify storage bucket exists and is public
3. Check database for correct image_path values
4. Test image URLs directly in browser

## Testing

### Manual Testing
1. Fetch news articles via MCP server
2. Verify images are downloaded and stored
3. Check UI displays images correctly
4. Test error handling with broken URLs

### Automated Testing
- Unit tests for image validation
- Integration tests for storage operations
- UI tests for image display

## Conclusion

This implementation provides a robust solution for news article images that:
- Eliminates CORS issues
- Prevents broken image links
- Improves performance and reliability
- Maintains a clean, organized storage structure
- Provides comprehensive error handling
- Offers a great user experience

The system is designed to be scalable, maintainable, and user-friendly while solving the core problems of external image dependencies.
