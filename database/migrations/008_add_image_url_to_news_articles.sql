-- Add image URL support to news articles
-- Migration: 008_add_image_url_to_news_articles.sql
-- Description: Adds image storage columns to store article preview images

-- Add image columns to news_articles table
ALTER TABLE news_articles 
ADD COLUMN image_url VARCHAR(500),
ADD COLUMN image_path VARCHAR(500),
ADD COLUMN image_name VARCHAR(255),
ADD COLUMN image_size INTEGER,
ADD COLUMN image_width INTEGER,
ADD COLUMN image_height INTEGER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_image_url ON news_articles(image_url);
CREATE INDEX IF NOT EXISTS idx_news_image_path ON news_articles(image_path);
