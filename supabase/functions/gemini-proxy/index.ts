// @ts-ignore -- Deno environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';

// Configuration
const SECURITY_CONFIG = {
  allowedTasks: [], // Empty array to allow all tasks
  maxPromptLength: 10000,
  maxDataSize: 1000000, // 1MB
};

const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
};

// Rate limiting storage (in-memory for demo, should use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Validation functions
function validateRequest(request: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if task is allowed (only if allowedTasks is not empty)
  if (SECURITY_CONFIG.allowedTasks.length > 0 && !SECURITY_CONFIG.allowedTasks.includes(request.task)) {
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

async function callGeminiAPI(request: any): Promise<{ text: string; usage?: any }> {
  try {
    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    // Initialize Google Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: request.model || 'gemini-2.5-flash',
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

    // Generate content
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

async function handleGeminiProxyRequest(
  request: any,
  clientId: string
): Promise<any> {
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

    const response = {
      success: true,
      data: {
        text: geminiResponse.text,
        usage: geminiResponse.usage,
      },
      timestamp: new Date().toISOString(),
      source: 'google-gemini-proxy',
    };

    return response;
  } catch (error) {
    console.error('Error in Gemini proxy request handler:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';

    const errorResponse = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      source: 'google-gemini-proxy',
    };

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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
        },
      },
    );
  }

  try {
    // Get client ID for rate limiting
    const clientId = getClientId(req);

    // Parse and validate request body
    const body = await req.json();
    
    // Basic validation
    if (!body.task || !body.prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: task and prompt',
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

    // Process the request
    const response = await handleGeminiProxyRequest(body, clientId);

    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
        },
      },
    );
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        source: 'google-gemini-proxy',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
        },
      },
    );
  }
});