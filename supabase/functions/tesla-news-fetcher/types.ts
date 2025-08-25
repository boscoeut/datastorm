// Type definitions for Tesla News Edge Function

export interface NewsArticle {
  id?: string;
  title: string;
  content?: string | null;
  summary?: string | null;
  source_url?: string | null;
  source_name?: string | null;
  published_date?: string | null;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface TeslaNewsResponse {
  success: boolean;
  articles: NewsArticle[];
  count: number;
  timestamp: string;
  source: 'google-gemini';
  error?: string;
}

export interface DatabaseInsertResult {
  success: boolean;
  inserted: number;
  errors: string[];
}

export interface GeminiArticleResponse {
  title: string;
  summary: string;
  category: string;
  tags: string[];
}

// Environment variables interface
export interface EnvironmentVariables {
  GOOGLE_GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// API request/response types
export interface ApiError {
  success: false;
  error: string;
  timestamp?: string;
  source?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
  source: string;
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

// CORS configuration
export interface CorsConfig {
  allowOrigin: string;
  allowMethods: HttpMethod[];
  allowHeaders: string[];
}
