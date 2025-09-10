# Image Preview Implementation for News Articles

## Overview
This implementation adds image preview functionality to news articles in the Electric Vehicle Data Hub. Articles now display relevant images alongside their content in the news feed.

## Changes Made

### 1. Database Schema Update
- **File**: `database/migrations/008_add_image_url_to_news_articles.sql`
- **Changes**: Added `image_url` column to `news_articles` table
- **Purpose**: Store URLs of article preview images

### 2. Backend News Fetcher Enhancement
- **File**: `supabase/functions/mcp-server/news-fetcher.ts`
- **Changes**:
  - Added `image_url` field to `NewsArticle` interface
  - Created `searchArticleImage()` function to find relevant images using Google Search API
  - Updated Gemini prompts to extract image URLs from search results
  - Enhanced article processing to fetch images for articles without them
  - Updated database insertion to include image URLs

### 3. Frontend UI Updates
- **File**: `web/src/components/news/NewsFeed.tsx`
- **Changes**:
  - Added image display in article cards
  - Implemented responsive image layout (full width on mobile, fixed width on desktop)
  - Added placeholder image for articles without images
  - Added error handling for failed image loads

### 4. Type Definitions
- **File**: `web/src/types/database.ts`
- **Changes**: Added `image_url?: string` to `NewsArticle` interface

## Features

### Image Search
- Uses Google Search API to find relevant images for articles
- Searches for images based on article title
- Falls back gracefully if no images are found

### UI Display
- Images are displayed in a consistent 32x36 (mobile) or 48x36 (desktop) format
- Responsive design that works on all screen sizes
- Placeholder icon for articles without images
- Error handling for broken image URLs

### Database Storage
- Image URLs are stored in the `news_articles` table
- Indexed for performance
- Optional field (can be null/undefined)

## Usage

### For New Articles
When new articles are fetched via the MCP server:
1. Articles are processed through Gemini to extract structured data
2. If no image URL is found, the system searches for relevant images
3. Images are stored in the database with the article

### For Existing Articles
- Existing articles without images will show a placeholder icon
- New articles fetched will automatically include image search

## Testing
- Created test script: `test-image-search.ts`
- Test the image search functionality independently
- Verify UI displays images correctly

## Configuration Required
- Google Search API key (`GOOGLE_SEARCH_API_KEY`)
- Google Search Engine ID (`GOOGLE_SEARCH_ENGINE_ID`)
- Google Gemini API key (`GOOGLE_GEMINI_API_KEY`)

## Future Enhancements
- Image caching and optimization
- Multiple image support per article
- Image quality validation
- Fallback to different image sources
