import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { updateVehicleDetails, VehicleUpdateParams } from './vehicle-updater.ts'
import { executeSearchEVs } from './ev-search.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Create service role client for admin checks
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// MCP Tool Definitions
interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
}

// Google Search Types
interface GoogleSearchParams {
  query: string;
  num_results?: number;
  site_restriction?: string;
  language?: string;
  start_index?: number;
}

interface GoogleImageSearchParams {
  query: string;
  num_results?: number;
  site_restriction?: string;
  language?: string;
  start_index?: number;
  image_size?: 'huge' | 'icon' | 'large' | 'medium' | 'small' | 'xlarge' | 'xxlarge';
  image_type?: 'clipart' | 'face' | 'lineart' | 'stock' | 'photo' | 'animated';
  image_color_type?: 'color' | 'gray' | 'trans';
  safe?: 'active' | 'off';
}

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  pagemap?: {
    metatags?: Array<{
      [key: string]: string;
    }>;
  };
}

interface GoogleImageSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  image: {
    contextLink: string;
    height: number;
    width: number;
    byteSize: number;
    thumbnailLink: string;
    thumbnailHeight: number;
    thumbnailWidth: number;
  };
  pagemap?: {
    metatags?: Array<{
      [key: string]: string;
    }>;
  };
}

interface GoogleSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: GoogleSearchResult[];
}

interface GoogleImageSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
      searchType: string;
    }>;
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: GoogleImageSearchResult[];
}

interface ProcessedSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
}

interface ProcessedImageSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  imageSize: number;
  contextUrl: string;
}

interface SearchResponse {
  success: boolean;
  results: ProcessedSearchResult[];
  totalResults: string;
  searchTime: number;
  query: string;
  timestamp: string;
  source: 'datastorm-mcp-server';
  error?: string;
}

interface ImageSearchResponse {
  success: boolean;
  results: ProcessedImageSearchResult[];
  totalResults: string;
  searchTime: number;
  query: string;
  timestamp: string;
  source: 'datastorm-mcp-server';
  error?: string;
}

// Rate limiting types
interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
}

interface RequestCount {
  count: number;
  resetTime: number;
}

// Configuration
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
};

// Rate limiting storage (in-memory for demo, should use Redis in production)
const requestCounts = new Map<string, RequestCount>();

// Validation schemas
const GoogleSearchParamsSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  num_results: z.number().min(1).max(100).optional(),
  site_restriction: z.string().optional(),
  language: z.string().optional(),
  start_index: z.number().min(1).optional(),
});

const GoogleImageSearchParamsSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  num_results: z.number().min(1).max(100).optional(),
  site_restriction: z.string().optional(),
  language: z.string().optional(),
  start_index: z.number().min(1).optional(),
  image_size: z.enum(['huge', 'icon', 'large', 'medium', 'small', 'xlarge', 'xxlarge']).optional(),
  image_type: z.enum(['clipart', 'face', 'lineart', 'stock', 'photo', 'animated']).optional(),
  image_color_type: z.enum(['color', 'gray', 'trans']).optional(),
  safe: z.enum(['active', 'off']).optional(),
});

const VehicleUpdateParamsSchema = z.object({
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  trim: z.string().optional(),
  year: z.number().min(1900).max(2100).optional(),
});

// Define available MCP tools
const mcpTools: MCPTool[] = [
  {
    name: 'populate-images',
    description: 'Populate vehicle image galleries by searching for and downloading images from Google Search. Requires admin privileges.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: {
          type: 'string',
          description: 'Vehicle ID to populate images for'
        },
        model: {
          type: 'string',
          description: 'Vehicle model name'
        },
        trim: {
          type: 'string',
          description: 'Vehicle trim level (optional)'
        },
        manufacturer: {
          type: 'string',
          description: 'Vehicle manufacturer (optional)'
        },
        maxImages: {
          type: 'number',
          description: 'Maximum number of images to download (default: 8)',
          minimum: 1,
          maximum: 20
        }
      },
      required: ['vehicleId', 'model']
    }
  },
  {
    name: 'update-vehicle-details',
    description: 'Update vehicle details including specifications, news articles, and manufacturer information. Performs comprehensive research and database updates.',
    inputSchema: {
      type: 'object',
      properties: {
        manufacturer: {
          type: 'string',
          description: 'Vehicle manufacturer name (e.g., "Tesla", "Ford")'
        },
        model: {
          type: 'string',
          description: 'Vehicle model name (e.g., "Model 3", "F-150 Lightning")'
        },
        trim: {
          type: 'string',
          description: 'Vehicle trim level (optional, e.g., "Performance", "Long Range")'
        },
        year: {
          type: 'number',
          description: 'Model year (optional, defaults to current year)'
        }
      },
      required: ['manufacturer', 'model']
    }
  },
  {
    name: 'web_search',
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
  {
    name: 'image_search',
    description: 'Search for images using Google\'s Programmable Search Engine',
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
        image_size: {
          type: 'string',
          enum: ['huge', 'icon', 'large', 'medium', 'small', 'xlarge', 'xxlarge'],
          description: 'Filter by image size',
        },
        image_type: {
          type: 'string',
          enum: ['clipart', 'face', 'lineart', 'stock', 'photo', 'animated'],
          description: 'Filter by image type',
        },
        image_color_type: {
          type: 'string',
          enum: ['color', 'gray', 'trans'],
          description: 'Filter by color type',
        },
        safe: {
          type: 'string',
          enum: ['active', 'off'],
          description: 'Safe search setting',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search-evs',
    description: 'Use Gemini AI to research and compile comprehensive lists of Electric Vehicles for specific manufacturers and models',
    inputSchema: {
      type: 'object',
      properties: {
        manufacturer: {
          type: 'string',
          description: 'Vehicle manufacturer (e.g., "Tesla", "Ford", "BMW")',
        },
        model: {
          type: 'string',
          description: 'Vehicle model (optional, e.g., "Model 3", "F-150 Lightning", "iX"). If not provided, searches for all models from the manufacturer.',
        },
        trim: {
          type: 'string',
          description: 'Specific trim level (optional, e.g., "Performance", "Long Range", "Platinum")',
        },
        year: {
          type: 'number',
          description: 'Model year (optional, defaults to current year)',
          minimum: 2020,
          maximum: 2030,
        },
        includeAllTrims: {
          type: 'boolean',
          description: 'Whether to include all available trim levels for the model (default: true)',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of vehicles to return (default: 20)',
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['manufacturer'],
    },
  },
]

// Check if user is admin
async function checkAdminPermission(userId: string): Promise<boolean> {
  try {
    console.log('Calling is_admin RPC with user_id:', userId)
    const { data, error } = await supabaseAdmin.rpc('is_admin', { user_uuid: userId })
    console.log('is_admin RPC result:', { data, error })
    if (error) {
      console.error('Error checking admin permission:', error)
      return false
    }
    return data === true
  } catch (error) {
    console.error('Error in checkAdminPermission:', error)
    return false
  }
}

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

    // Validate and sanitize parameters
    const numResults = Math.min(Math.max(params.num_results || 10, 1), 10); // Ensure between 1-10
    const startIndex = Math.max(params.start_index || 1, 1); // Ensure at least 1
    const query = params.query?.trim();
    
    if (!query) {
      throw new Error('Search query is required');
    }

    // Build search URL
    const baseUrl = 'https://www.googleapis.com/customsearch/v1';
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: query,
      num: String(numResults),
      start: String(startIndex),
    });

    // Add optional parameters
    if (params.site_restriction && params.site_restriction.trim()) {
      searchParams.append('siteSearch', params.site_restriction.trim());
    }
    if (params.language && params.language.trim()) {
      searchParams.append('lr', `lang_${params.language.trim()}`);
    }

    const url = `${baseUrl}?${searchParams.toString()}`;
    console.log('Google Search API URL:', url.replace(apiKey, '***')); // Log URL without API key

    // Make the API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Search API error response:', errorText);
      throw new Error(`Google Search API error: ${response.status} ${errorText}`);
    }

    const data: GoogleSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Google Search API:', error);
    throw new Error(`Google Search API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function callGoogleImageSearchAPI(params: GoogleImageSearchParams): Promise<GoogleImageSearchResponse> {
  try {
    const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (!apiKey || !searchEngineId) {
      throw new Error('Google Search API key or search engine ID not configured');
    }

    // Build search URL for image search
    const baseUrl = 'https://www.googleapis.com/customsearch/v1';
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: params.query,
      num: String(params.num_results || 10),
      start: String(params.start_index || 1),
      searchType: 'image', // This is the key difference for image search
    });

    // Add optional parameters
    if (params.site_restriction) {
      searchParams.append('siteSearch', params.site_restriction);
    }
    if (params.language) {
      searchParams.append('lr', `lang_${params.language}`);
    }
    if (params.image_size) {
      searchParams.append('imgSize', params.image_size);
    }
    if (params.image_type) {
      searchParams.append('imgType', params.image_type);
    }
    if (params.image_color_type) {
      searchParams.append('imgColorType', params.image_color_type);
    }
    if (params.safe) {
      searchParams.append('safe', params.safe);
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
      throw new Error(`Google Image Search API error: ${response.status} ${errorText}`);
    }

    const data: GoogleImageSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Google Image Search API:', error);
    throw new Error(`Google Image Search API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

function processImageSearchResults(googleResponse: GoogleImageSearchResponse): ProcessedImageSearchResult[] {
  if (!googleResponse.items) {
    return [];
  }

  return googleResponse.items.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    displayLink: item.displayLink,
    formattedUrl: item.formattedUrl,
    imageUrl: item.link, // The main image URL
    thumbnailUrl: item.image.thumbnailLink,
    imageWidth: item.image.width,
    imageHeight: item.image.height,
    thumbnailWidth: item.image.thumbnailWidth,
    thumbnailHeight: item.image.thumbnailHeight,
    imageSize: item.image.byteSize,
    contextUrl: item.image.contextLink,
  }));
}

// MCP Server initialization
function handleInitialize(request: any): any {
  console.log('MCP Server: Handling initialize request')
  
  return {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false
        }
      },
      serverInfo: {
        name: 'datastorm-mcp-server',
        version: '2.1.0',
        description: 'MCP Server for Electric Vehicle Data Hub with populate-images, update-vehicle-details, web_search, image_search, and search-evs functionality'
      }
    }
  }
}

// List available tools
function handleToolsList(request: any): any {
  console.log('MCP Server: Handling tools/list request')
  
  return {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      tools: mcpTools
    }
  }
}

// Execute a tool
async function handleToolsCall(request: any, token: string, isServiceToken: boolean = false): Promise<any> {
  console.log('MCP Server: Handling tools/call request for:', request.params.name)
  
  const { name, arguments: args } = request.params
  
  if (name === 'populate-images') {
    return await executePopulateImages(args, token, request.id, isServiceToken)
  } else if (name === 'update-vehicle-details') {
    return await executeUpdateVehicleDetails(args, token, request.id, isServiceToken)
  } else if (name === 'web_search') {
    return await executeWebSearch(args, request.id)
  } else if (name === 'image_search') {
    return await executeImageSearch(args, request.id)
  } else if (name === 'search-evs') {
    return await executeSearchEVs(args, request.id)
  }
  
  // Tool not found
  return {
    jsonrpc: '2.0',
    id: request.id,
    error: {
      code: -32601,
      message: 'Method not found',
      data: `Tool '${name}' is not available`
    }
  }
}

// Execute web search functionality
async function executeWebSearch(args: any, requestId: any): Promise<any> {
  console.log('MCP Server: Executing web_search with args:', args)
  
  try {
    // Validate parameters for web search
    const validatedParams = GoogleSearchParamsSchema.parse(args);

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
      source: 'datastorm-mcp-server',
    };

    return {
      jsonrpc: '2.0',
      id: requestId,
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
    console.error('Error in web search execution:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: 'Internal error',
        data: `web_search execution failed: ${errorMessage}`,
      },
    };
  }
}

// Execute image search functionality
async function executeImageSearch(args: any, requestId: any): Promise<any> {
  console.log('MCP Server: Executing image_search with args:', args)
  
  try {
    // Validate parameters for image search
    const validatedParams = GoogleImageSearchParamsSchema.parse(args);

    // Call Google Image Search API
    const googleResponse = await callGoogleImageSearchAPI(validatedParams);

    // Process results
    const processedResults = processImageSearchResults(googleResponse);

    // Create response
    const imageSearchResponse: ImageSearchResponse = {
      success: true,
      results: processedResults,
      totalResults: googleResponse.searchInformation?.totalResults || '0',
      searchTime: googleResponse.searchInformation?.searchTime || 0,
      query: validatedParams.query,
      timestamp: new Date().toISOString(),
      source: 'datastorm-mcp-server',
    };

    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(imageSearchResponse, null, 2),
          },
        ],
        isError: false,
      },
    };
  } catch (error) {
    console.error('Error in image search execution:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: 'Internal error',
        data: `image_search execution failed: ${errorMessage}`,
      },
    };
  }
}

// Execute update-vehicle-details functionality
async function executeUpdateVehicleDetails(args: any, token: string, requestId: any, isServiceToken: boolean = false): Promise<any> {
  console.log('MCP Server: Executing update-vehicle-details with args:', args)
  
  try {
    let userId: string | null = null
    let isAdmin = false

    if (isServiceToken) {
      // For service tokens, we'll allow admin operations
      console.log('Service token detected, allowing admin operations')
      userId = 'service-admin'
      isAdmin = true
    } else {
      // Try to verify as user token
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (authError || !user) {
        return {
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32000,
            message: 'Authentication failed',
            data: 'Invalid or expired token'
          }
        }
      }

      console.log('User authenticated:', user.id)
      userId = user.id
      
      // Check admin permission for user tokens
      isAdmin = await checkAdminPermission(user.id)
    }
    
    if (!isAdmin) {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32000,
          message: 'Access denied',
          data: 'Admin privileges required. Only administrators can update vehicle details.'
        }
      }
    }

    // Validate parameters
    const validatedParams = VehicleUpdateParamsSchema.parse(args);

    console.log('All validations passed, starting vehicle details update...')

    // Execute vehicle update
    const result = await updateVehicleDetails(
      validatedParams as VehicleUpdateParams,
      supabaseUrl,
      supabaseServiceKey
    )

    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }

  } catch (error) {
    console.error('Error in update-vehicle-details execution:', error)
    
    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: 'Internal error',
        data: `update-vehicle-details execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Execute populate-images functionality
async function executePopulateImages(args: any, token: string, requestId: any, isServiceToken: boolean = false): Promise<any> {
  console.log('MCP Server: Executing populate-images with args:', args)
  
  try {
    let userId: string | null = null
    let isAdmin = false

    if (isServiceToken) {
      // For service tokens, we'll allow admin operations
      // This is a development convenience - in production you'd want stricter controls
      console.log('Service token detected, allowing admin operations')
      userId = 'service-admin' // Placeholder for service operations
      isAdmin = true
    } else {
      // Try to verify as user token
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (authError || !user) {
        return {
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32000,
            message: 'Authentication failed',
            data: 'Invalid or expired token'
          }
        }
      }

      console.log('User authenticated:', user.id)
      userId = user.id
      
      // Check admin permission for user tokens
      isAdmin = await checkAdminPermission(user.id)
    }
    
    if (!isAdmin) {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32000,
          message: 'Access denied',
          data: 'Admin privileges required. Only administrators can populate vehicle images.'
        }
      }
    }

    // Validate required fields
    if (!args.vehicleId || !args.model) {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32602,
          message: 'Invalid params',
          data: 'vehicleId and model are required'
        }
      }
    }

    console.log('All validations passed, starting image population...')

    // Create a user-specific client for storage operations
    // For service tokens, use the service key directly
    const supabaseUser = isServiceToken 
      ? supabaseAdmin 
      : createClient(supabaseUrl, supabaseServiceKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        })

    // Step 1: Search for vehicle images using Google Search
    console.log('Searching for vehicle images using Google Search...')
    
    // Build search query
    const searchQuery = `${args.manufacturer || ''} ${args.model} ${args.trim || ''} car image`.trim()
    console.log('Search query:', searchQuery)

    // Use internal Google Image Search API
    const searchParams: GoogleImageSearchParams = {
      query: searchQuery,
      num_results: args.maxImages || 8,
      image_size: 'large',
      image_type: 'photo'
    }

    const googleResponse = await callGoogleImageSearchAPI(searchParams)
    console.log('Google Search response:', JSON.stringify(googleResponse, null, 2))

    if (!googleResponse.items || googleResponse.items.length === 0) {
      throw new Error('No images found in search results')
    }

    const searchData = {
      success: true,
      results: processImageSearchResults(googleResponse)
    }
    console.log('Processed search data:', JSON.stringify(searchData, null, 2))

    console.log(`Found ${searchData.results.length} images from Google Search`)

    // Step 2: Download and upload images
    const uploadedImages = []
    const errors = []

    for (let i = 0; i < Math.min(searchData.results.length, args.maxImages || 8); i++) {
      const imageResult = searchData.results[i]
      console.log(`Processing image ${i + 1}/${searchData.results.length}:`, imageResult.imageUrl)

      try {
        // Download image
        const imageResponse = await fetch(imageResult.imageUrl)
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`)
        }

        const imageData = new Uint8Array(await imageResponse.arrayBuffer())
        console.log(`Downloaded image ${i + 1}, size: ${imageData.length} bytes`)

        // Generate filename and path
        const fileExtension = imageResult.imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
        const fileName = `${args.vehicleId}_${Date.now()}_${i}.${fileExtension}`
        const filePath = `${args.vehicleId}/${fileName}`

        // Upload to Supabase storage
        console.log(`Uploading image ${i + 1} to storage:`, filePath)
        const uploadResponse = await supabaseUser.storage
          .from('vehicle-images')
          .upload(filePath, imageData, {
            contentType: imageResponse.headers.get('content-type') || 'image/jpeg',
            upsert: false
          })

        if (uploadResponse.error) {
          throw new Error(`Storage upload failed: ${uploadResponse.error.message}`)
        }

        console.log(`Image ${i + 1} uploaded successfully!`)

        // Step 3: Insert record into vehicle_images table
        const imageRecord = {
          vehicle_id: args.vehicleId,
          image_url: `${supabaseUrl}/storage/v1/object/public/vehicle-images/${filePath}`,
          image_path: filePath,
          image_name: fileName,
          image_type: 'gallery',
          file_size: imageData.length,
          width: imageResult.imageWidth || null,
          height: imageResult.imageHeight || null,
          alt_text: imageResult.title || `Image of ${args.model} ${args.trim || ''}`.trim(),
          display_order: i,
          is_active: true
        }

        console.log(`Inserting record for image ${i + 1}:`, JSON.stringify(imageRecord, null, 2))

        const { data: insertData, error: insertError } = await supabaseUser
          .from('vehicle_images')
          .insert([imageRecord])
          .select()

        if (insertError) {
          throw new Error(`Database insert failed: ${insertError.message}`)
        }

        console.log(`Image ${i + 1} record inserted successfully!`)
        if (insertData && insertData[0]) {
          uploadedImages.push(insertData[0])
        }

      } catch (imageError) {
        console.error(`Error processing image ${i + 1}:`, imageError)
        const errorMessage = `Image ${i + 1}: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`
        errors.push(errorMessage)
      }
    }

    const result = {
      success: uploadedImages.length > 0,
      imagesUploaded: uploadedImages.length,
      imagesSearched: searchData.results.length,
      errors: errors,
      message: `Successfully uploaded ${uploadedImages.length} images for ${args.model}`,
      uploadedImages: uploadedImages
    }

    console.log('Final result:', result)

    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }

  } catch (error) {
    console.error('Error in populate-images execution:', error)
    
    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: 'Internal error',
        data: `populate-images execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Main request handler
serve(async (req) => {
  console.log('=== MCP SERVER FUNCTION CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get authorization header (only required for tools/call)
    const authHeader = req.headers.get('Authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '') : null
    
    // For service tokens, we need to handle them specially
    // Service tokens start with 'sbp_' and are not JWT tokens
    const isServiceToken = token && token.startsWith('sbp_')
    
    // Parse request body
    let requestBody: any
    try {
      const rawBody = await req.text()
      console.log('Raw request body:', rawBody)
      requestBody = JSON.parse(rawBody)
      console.log('Parsed request body:', JSON.stringify(requestBody, null, 2))
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate JSON-RPC 2.0 format
    if (!requestBody.jsonrpc || requestBody.jsonrpc !== '2.0' || !requestBody.method) {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: requestBody.id || null,
          error: {
            code: -32600,
            message: 'Invalid Request',
            data: 'Request must be valid JSON-RPC 2.0 format'
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let response: any

    // Route MCP requests
    switch (requestBody.method) {
      case 'initialize':
        response = handleInitialize(requestBody)
        break
      
      case 'tools/list':
        response = handleToolsList(requestBody)
        break
      
      case 'tools/call':
        // Require authentication for tool execution
        if (!token) {
          response = {
            jsonrpc: '2.0',
            id: requestBody.id,
            error: {
              code: -32000,
              message: 'Authentication required',
              data: 'Authorization header required for tool execution'
            }
          }
        } else {
          // For service tokens, we'll pass a special flag
          response = await handleToolsCall(requestBody, token, isServiceToken || false)
        }
        break
      
      default:
        response = {
          jsonrpc: '2.0',
          id: requestBody.id,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Method '${requestBody.method}' is not supported`
          }
        }
    }

    console.log('MCP Server response:', JSON.stringify(response, null, 2))

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in MCP server function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})