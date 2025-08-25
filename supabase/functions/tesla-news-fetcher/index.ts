// @ts-ignore -- Deno environment
import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';



// Import types from separate file
import type {
  DatabaseInsertResult,
  GeminiArticleResponse,
  NewsArticle,
  TeslaNewsResponse,
} from './types.ts';

// Zod schema for validating news article data
const NewsArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  source_url: z.string().url().optional().nullable(),
  source_name: z.string().optional().nullable(),
  published_date: z.string().datetime().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

// Zod schema for the complete response
const TeslaNewsResponseSchema = z.object({
  success: z.boolean(),
  articles: z.array(NewsArticleSchema),
  count: z.number().min(0),
  timestamp: z.string(),
  source: z.literal('google-gemini'),
  error: z.string().optional(),
});



// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(
  Deno.env.get('GOOGLE_GEMINI_API_KEY') || '',
);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Prompt for Tesla news generation
const TESLA_NEWS_PROMPT =
  `Generate 5-10 recent news stories about Tesla (the electric vehicle company) for today. 
Each story should include:
- A compelling headline
- A brief summary (2-3 sentences)
- The category (e.g., "Industry News", "Technology", "Regulatory", "Rumors")
- Relevant tags (e.g., ["tesla", "ev", "battery", "autonomous-driving"])

Format the response as a JSON array with this structure:
[
  {
    "title": "Headline here",
    "summary": "Brief summary here",
    "category": "Category here",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

Make sure the news is current and relevant to Tesla's business, technology, or industry position. 
Focus on recent developments, announcements, or significant events.

IMPORTANT: Respond with ONLY the JSON array, no additional text or explanations.`;

async function fetchTeslaNewsFromGemini(): Promise<NewsArticle[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(TESLA_NEWS_PROMPT);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Validate and transform the data
    const validatedArticles = z.array(z.object({
      title: z.string(),
      summary: z.string(),
      category: z.string(),
      tags: z.array(z.string()),
    })).parse(parsedData) as GeminiArticleResponse[];

    // Transform to match our NewsArticle interface
    return validatedArticles.map((article) => ({
      title: article.title,
      summary: article.summary,
      category: article.category,
      tags: article.tags,
      source_name: 'Google Gemini AI',
      published_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching news from Gemini:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';
    throw new Error(`Failed to fetch news from Gemini: ${errorMessage}`);
  }
}

async function insertNewsArticles(
  articles: NewsArticle[],
): Promise<DatabaseInsertResult> {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .insert(articles)
      .select();

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

    return {
      success: true,
      inserted: data?.length || 0,
      errors: [],
    };
  } catch (error) {
    console.error('Error inserting news articles:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';
    return {
      success: false,
      inserted: 0,
      errors: [errorMessage],
    };
  }
}

async function handleTeslaNewsRequest(): Promise<TeslaNewsResponse> {
  try {
    // Fetch news from Google Gemini
    const articles = await fetchTeslaNewsFromGemini();

    if (!articles || articles.length === 0) {
      return {
        success: false,
        articles: [],
        count: 0,
        timestamp: new Date().toISOString(),
        source: 'google-gemini',
        error: 'No news articles were generated',
      };
    }

    // Insert articles into database
    const insertResult = await insertNewsArticles(articles);

    if (!insertResult.success) {
      return {
        success: false,
        articles: [],
        count: 0,
        timestamp: new Date().toISOString(),
        source: 'google-gemini',
        error: `Database insertion failed: ${insertResult.errors.join(', ')}`,
      };
    }

    // Return success response
    const response: TeslaNewsResponse = {
      success: true,
      articles: articles,
      count: articles.length,
      timestamp: new Date().toISOString(),
      source: 'google-gemini',
    };

    // Validate response before returning
    return TeslaNewsResponseSchema.parse(response);
  } catch (error) {
    console.error('Error in Tesla news request handler:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';

    return {
      success: false,
      articles: [],
      count: 0,
      timestamp: new Date().toISOString(),
      source: 'google-gemini',
      error: errorMessage,
    };
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed. Use POST.',
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }

  try {
    // Process the request
    const response = await handleTeslaNewsRequest();

    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        source: 'google-gemini',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});
