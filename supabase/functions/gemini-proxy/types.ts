// Type definitions for Gemini Proxy Edge Function

export interface GeminiProxyRequest {
  task: string;
  prompt: string;
  data?: Record<string, any>;
  expectedOutput?: string; // Description of expected output format
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Array<{
    googleSearch?: {};
    [key: string]: any;
  }>;
}

export interface GeminiProxyResponse {
  success: boolean;
  data?: {
    text: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: string;
  timestamp: string;
  source: 'google-gemini-proxy';
}

export interface GeminiApiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface DatabaseLogEntry {
  task: string;
  prompt: string;
  response: string;
  success: boolean;
  error?: string;
  created_at: string;
  user_id?: string;
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

// Rate limiting configuration
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
}

// Security configuration
export interface SecurityConfig {
  allowedTasks: string[];
  maxPromptLength: number;
  maxDataSize: number;
}

// Task types for validation
export type TaskType = 
  | 'analyze_vehicle_data'
  | 'generate_content'
  | 'summarize_text'
  | 'answer_question'
  | 'custom_task';

// Validation schemas
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
