-- Increase field sizes for news articles to handle longer content
-- Migration: 009_increase_news_article_field_sizes.sql
-- Description: Increases VARCHAR field sizes to accommodate longer article content

-- Increase title field size
ALTER TABLE news_articles 
ALTER COLUMN title TYPE VARCHAR(1000);

-- Increase source_url field size  
ALTER TABLE news_articles 
ALTER COLUMN source_url TYPE VARCHAR(1000);

-- Increase source_name field size
ALTER TABLE news_articles 
ALTER COLUMN source_name TYPE VARCHAR(500);

-- Increase category field size
ALTER TABLE news_articles 
ALTER COLUMN category TYPE VARCHAR(200);
