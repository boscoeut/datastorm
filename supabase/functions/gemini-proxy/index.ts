// @ts-ignore -- Deno environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';
import { z } from 'https://esm.sh/zod@3.22.4';

// Import types
import type {
  GeminiProxyRequest,
  GeminiProxyResponse,
  GeminiApiResponse,
  DatabaseLogEntry,
  ValidationResult,
  SecurityConfig,
  RateLimitConfig,
} from './types.ts';

// Configuration
const SECURITY_CONFIG: SecurityConfig = {
  allowedTasks: [
    'analyze_vehicle_data',
    'generate_content',
    'summarize_text',
    'answer_question',
    'custom_task'
  ],
  maxPromptLength: 10000,
  maxDataSize: 1000000, // 1MB
};

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
};

// Zod schema for request validation
const GeminiProxyRequestSchema = z.object({
  task: z.string().min(1, 'Task is required'),
  prompt: z.string().min(1, 'Prompt is required').max(SECURITY_CONFIG.maxPromptLength, 'Prompt too long'),
  data: z.record(z.any()).optional(),
  expectedOutput: z.string().optional().max(2000, 'Expected output description too long'),
  model: z.string().optional().default('gemini-2.0-flash-exp'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(8192).optional().default(2048),
  tools: z.array(z.record(z.any())).optional(),
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

// Rate limiting storage (in-memory for demo, should use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Validation functions
function validateRequest(request: GeminiProxyRequest): ValidationResult {
  const errors: string[] = [];

  // Check if task is allowed
  if (!SECURITY_CONFIG.allowedTasks.includes(request.task)) {
    errors.push(`Task '${request.task}' is not allowed`);
  }

  // Check prompt length
  if (request.prompt.length > SECURITY_CONFIG.maxPromptLength) {
    errors.push(`Prompt exceeds maximum length of ${SECURITY_CONFIG.maxPromptLength} characters`);
  }

  // Check data size
  if (request.data) {
    const dataSize = JSON.stringify(request.data).length;
    if (dataSize > SECURITY_CONFIG.maxDataSize) {
      errors.push(`Data size exceeds maximum of ${SECURITY_CONFIG.maxDataSize} bytes`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const minuteAgo = now - 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;

  // Get current counts
  const current = requestCounts.get(clientId) || { count: 0, resetTime: now };

  // Reset if needed
  if (current.resetTime < minuteAgo) {
    current.count = 0;
    current.resetTime = now;
  }

  // Check limits
  if (current.count >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
    return false;
  }

  // Update count
  current.count++;
  requestCounts.set(clientId, current);

  return true;
}

function getClientId(req: Request): string {
  // Use IP address as client ID (in production, use user ID or session token)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

async function callGeminiAPI(request: GeminiProxyRequest): Promise<GeminiApiResponse> {
  try {
    const model = genAI.getGenerativeModel({
      model: request.model || 'gemini-2.0-flash-exp',
      tools: request.tools || [],
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 2048,
      },
    });

    // Prepare the content with expected output guidance
    let content = request.prompt;
    
    // Add expected output guidance if provided
    if (request.expectedOutput) {
      content += `\n\nPlease provide your response in the following format: ${request.expectedOutput}`;
    }
    
    // Add context data if provided
    if (request.data) {
      content += `\n\nContext Data: ${JSON.stringify(request.data, null, 2)}`;
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: content }] }]
    });

    const response = await result.response;
    const text = response.text();

    // Get usage information if available
    const usage = response.usageMetadata ? {
      promptTokens: response.usageMetadata.promptTokenCount || 0,
      completionTokens: response.usageMetadata.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata.totalTokenCount || 0,
    } : undefined;

    return {
      text,
      usage,
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function logRequest(
  request: GeminiProxyRequest,
  response: GeminiProxyResponse,
  clientId: string
): Promise<void> {
  try {
    const logEntry: DatabaseLogEntry = {
      task: request.task,
      prompt: request.prompt.substring(0, 1000), // Truncate for storage
      response: response.data?.text?.substring(0, 1000) || '', // Truncate for storage
      success: response.success,
      error: response.error,
      created_at: new Date().toISOString(),
      user_id: clientId,
    };

    // Note: In production, you might want to store this in a dedicated table
    // For now, we'll just log to console
    console.log('Request logged:', JSON.stringify(logEntry, null, 2));
  } catch (error) {
    console.error('Error logging request:', error);
    // Don't fail the request if logging fails
  }
}

async function handleGeminiProxyRequest(
  request: GeminiProxyRequest,
  clientId: string
): Promise<GeminiProxyResponse> {
  try {
    // Validate request
    const validation = validateRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
        timestamp: new Date().toISOString(),
        source: 'google-gemini-proxy',
      };
    }

    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        timestamp: new Date().toISOString(),
        source: 'google-gemini-proxy',
      };
    }

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(request);

    const response: GeminiProxyResponse = {
      success: true,
      data: {
        text: geminiResponse.text,
        usage: geminiResponse.usage,
      },
      timestamp: new Date().toISOString(),
      source: 'google-gemini-proxy',
    };

    // Log the request (async, don't wait)
    logRequest(request, response, clientId).catch(console.error);

    return response;
  } catch (error) {
    console.error('Error in Gemini proxy request handler:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';

    const errorResponse: GeminiProxyResponse = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      source: 'google-gemini-proxy',
    };

    // Log the error (async, don't wait)
    logRequest(request, errorResponse, clientId).catch(console.error);

    return errorResponse;
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
        timestamp: new Date().toISOString(),
        source: 'google-gemini-proxy',
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
    // Get client ID for rate limiting
    const clientId = getClientId(req);

    // Parse and validate request body
    const body = await req.json();
    
    // Validate with Zod
    const validatedRequest = GeminiProxyRequestSchema.parse(body);

    // Process the request
    const response = await handleGeminiProxyRequest(validatedRequest, clientId);

    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('Unexpected error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
          timestamp: new Date().toISOString(),
          source: 'google-gemini-proxy',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        source: 'google-gemini-proxy',
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
