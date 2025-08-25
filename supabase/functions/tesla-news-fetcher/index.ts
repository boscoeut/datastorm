// @ts-ignore -- Deno environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

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

// Get the current date and the date 48 hours ago
const now = new Date();
const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

// Format them nicely for the prompt
const todayString = now.toLocaleDateString('en-US', { dateStyle: 'long' });
const startDateString = fortyEightHoursAgo.toLocaleDateString('en-US', { dateStyle: 'long' });


const TESLA_NEWS_PROMPT =
  `Today is ${todayString}. 
Generate 5 to 10 of the most significant news stories about Tesla (the electric vehicle company) published between ${startDateString} and today.
Each story must include:
- A compelling headline
- A brief summary (2-3 sentences)
- The category (e.g., "Industry News", "Technology", "Regulatory", "Financial")
- Relevant tags (e.g., ["tesla", "ev", "battery", "autonomous-driving"])
- The URL of the citation
- The source name

Format the response as a valid JSON array of objects with this structure:
[
  {
    "title": "Headline here",
    "summary": "Brief summary here",
    "category": "Category here",
    "tags": ["tag1", "tag2", "tag3"],
    "source_url": "The URL of the citation",
    "source_name": "Name of the news source"
  }
]

IMPORTANT: The news must be from the specified date range. Verify the publication dates. Respond with ONLY the JSON array.`;

async function fetchTeslaNewsFromGemini(): Promise<NewsArticle[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }],
      thinkingConfig: {
        thinkingBudget: 0,
      }
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: TESLA_NEWS_PROMPT }] }]
    });
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
      source_url: z.string(),
      source_name: z.string(),
    })).parse(parsedData) as GeminiArticleResponse[];

    // Transform to match our NewsArticle interface
    return validatedArticles.map((article) => ({
      title: article.title,
      summary: article.summary,
      category: article.category,
      tags: article.tags,
      source_url: article.source_url,
      source_name: article.source_name,
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
