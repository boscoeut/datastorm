// @ts-ignore -- Deno environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Import types
import type {
  MCPRequest,
  MCPResponse,
  MCPError,
  MCPServerCapabilities,
  MCPTool,
  GoogleSearchParams,
  GoogleSearchResponse,
  ProcessedSearchResult,
  SearchResponse,
  RateLimitConfig,
  RequestCount,
} from './types.ts';

// Configuration
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
};

// Rate limiting storage (in-memory for demo, should use Redis in production)
const requestCounts = new Map<string, RequestCount>();

// MCP Server Capabilities
const SERVER_CAPABILITIES: MCPServerCapabilities = {
  tools: {
    listChanged: true,
  },
};

// Available tools
const AVAILABLE_TOOLS: MCPTool[] = [
  {
    name: 'google_search',
    description: 'Perform web searches using Google\'s Programmable Search Engine',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query string',
        },
        num_results: {
          type: 'number',
          description: 'Number of results to return (default: 10, max: 100)',
          minimum: 1,
          maximum: 100,
        },
        site_restriction: {
          type: 'string',
          description: 'Restrict search to a specific site (e.g., "example.com")',
        },
        language: {
          type: 'string',
          description: 'Search language preference (e.g., "en", "es", "fr")',
        },
        start_index: {
          type: 'number',
          description: 'Starting index for pagination (default: 1)',
          minimum: 1,
        },
      },
      required: ['query'],
    },
  },
];

// Validation schemas
const GoogleSearchParamsSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  num_results: z.number().min(1).max(100).optional(),
  site_restriction: z.string().optional(),
  language: z.string().optional(),
  start_index: z.number().min(1).optional(),
});

// Rate limiting functions
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

// Google Search API functions
async function callGoogleSearchAPI(params: GoogleSearchParams): Promise<GoogleSearchResponse> {
  try {
    const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (!apiKey || !searchEngineId) {
      throw new Error('Google Search API key or search engine ID not configured');
    }

    // Build search URL
    const baseUrl = 'https://www.googleapis.com/customsearch/v1';
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: params.query,
      num: String(params.num_results || 10),
      start: String(params.start_index || 1),
    });

    // Add optional parameters
    if (params.site_restriction) {
      searchParams.append('siteSearch', params.site_restriction);
    }
    if (params.language) {
      searchParams.append('lr', `lang_${params.language}`);
    }

    const url = `${baseUrl}?${searchParams.toString()}`;

    // Make the API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Search API error: ${response.status} ${errorText}`);
    }

    const data: GoogleSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Google Search API:', error);
    throw new Error(`Google Search API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function processSearchResults(googleResponse: GoogleSearchResponse): ProcessedSearchResult[] {
  if (!googleResponse.items) {
    return [];
  }

  return googleResponse.items.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    displayLink: item.displayLink,
    formattedUrl: item.formattedUrl,
  }));
}

// MCP Protocol handlers
function handleInitialize(): MCPResponse {
  return {
    jsonrpc: '2.0',
    id: 1,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: SERVER_CAPABILITIES,
      serverInfo: {
        name: 'google-search-mcp-server',
        version: '1.0.0',
      },
    },
  };
}

function handleToolsList(): MCPResponse {
  return {
    jsonrpc: '2.0',
    id: 1,
    result: {
      tools: AVAILABLE_TOOLS,
    },
  };
}

async function handleToolsCall(params: any): Promise<MCPResponse> {
  try {
    // Validate parameters
    const validatedParams = GoogleSearchParamsSchema.parse(params.arguments);

    // Call Google Search API
    const googleResponse = await callGoogleSearchAPI(validatedParams);

    // Process results
    const processedResults = processSearchResults(googleResponse);

    // Create response
    const searchResponse: SearchResponse = {
      success: true,
      results: processedResults,
      totalResults: googleResponse.searchInformation?.totalResults || '0',
      searchTime: googleResponse.searchInformation?.searchTime || 0,
      query: validatedParams.query,
      timestamp: new Date().toISOString(),
      source: 'google-search-mcp',
    };

    return {
      jsonrpc: '2.0',
      id: params.id || 1,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(searchResponse, null, 2),
          },
        ],
        isError: false,
      },
    };
  } catch (error) {
    console.error('Error in tools/call handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    const errorResponse: MCPError = {
      code: -32603,
      message: 'Internal error',
      data: errorMessage,
    };

    return {
      jsonrpc: '2.0',
      id: params.id || 1,
      error: errorResponse,
    };
  }
}

// Main MCP request handler
async function handleMCPRequest(request: MCPRequest, clientId: string): Promise<MCPResponse> {
  try {
    // Check rate limit
    if (!checkRateLimit(clientId)) {
      const error: MCPError = {
        code: -32000,
        message: 'Rate limit exceeded. Please try again later.',
      };
      return {
        jsonrpc: '2.0',
        id: request.id,
        error,
      };
    }

    // Route MCP requests
    switch (request.method) {
      case 'initialize':
        return handleInitialize();
      case 'tools/list':
        return handleToolsList();
      case 'tools/call':
        return await handleToolsCall(request.params);
      default:
        const error: MCPError = {
          code: -32601,
          message: `Method not found: ${request.method}`,
        };
        return {
          jsonrpc: '2.0',
          id: request.id,
          error,
        };
    }
  } catch (error) {
    console.error('Error handling MCP request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    const mcpError: MCPError = {
      code: -32603,
      message: 'Internal error',
      data: errorMessage,
    };

    return {
      jsonrpc: '2.0',
      id: request.id,
      error: mcpError,
    };
  }
}

// Direct search handler (non-MCP)
async function handleDirectSearch(params: GoogleSearchParams, clientId: string): Promise<SearchResponse> {
  try {
    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return {
        success: false,
        results: [],
        totalResults: '0',
        searchTime: 0,
        query: params.query,
        timestamp: new Date().toISOString(),
        source: 'google-search-mcp',
        error: 'Rate limit exceeded. Please try again later.',
      };
    }

    // Validate parameters
    const validatedParams = GoogleSearchParamsSchema.parse(params);

    // Call Google Search API
    const googleResponse = await callGoogleSearchAPI(validatedParams);

    // Process results
    const processedResults = processSearchResults(googleResponse);

    return {
      success: true,
      results: processedResults,
      totalResults: googleResponse.searchInformation?.totalResults || '0',
      searchTime: googleResponse.searchInformation?.searchTime || 0,
      query: validatedParams.query,
      timestamp: new Date().toISOString(),
      source: 'google-search-mcp',
    };
  } catch (error) {
    console.error('Error in direct search handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      results: [],
      totalResults: '0',
      searchTime: 0,
      query: params.query,
      timestamp: new Date().toISOString(),
      source: 'google-search-mcp',
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
        source: 'google-search-mcp',
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

    // Parse request body
    const body = await req.json();

    // Check if this is an MCP request or direct search
    if (body.jsonrpc === '2.0' && body.method) {
      // Handle MCP protocol request
      const mcpRequest: MCPRequest = body;
      const mcpResponse = await handleMCPRequest(mcpRequest, clientId);

      return new Response(
        JSON.stringify(mcpResponse),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
          },
        },
      );
    } else if (body.query) {
      // Handle direct search request
      const searchParams: GoogleSearchParams = body;
      const searchResponse = await handleDirectSearch(searchParams, clientId);

      return new Response(
        JSON.stringify(searchResponse),
        {
          status: searchResponse.success ? 200 : 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
          },
        },
      );
    } else {
      // Invalid request format
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request format. Provide either MCP protocol request or direct search parameters.',
          timestamp: new Date().toISOString(),
          source: 'google-search-mcp',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
          },
        },
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        source: 'google-search-mcp',
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
