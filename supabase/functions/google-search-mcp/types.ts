// Type definitions for Google Search MCP Server Edge Function

// MCP Protocol Types
export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

// MCP Server Capabilities
export interface MCPServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// Google Search Types
export interface GoogleSearchParams {
  query: string;
  num_results?: number;
  site_restriction?: string;
  language?: string;
  start_index?: number;
}

export interface GoogleSearchResult {
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

export interface GoogleSearchResponse {
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

export interface ProcessedSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
}

export interface SearchResponse {
  success: boolean;
  results: ProcessedSearchResult[];
  totalResults: string;
  searchTime: number;
  query: string;
  timestamp: string;
  source: 'google-search-mcp';
  error?: string;
}

// Environment variables interface
export interface EnvironmentVariables {
  GOOGLE_SEARCH_API_KEY: string;
  GOOGLE_SEARCH_ENGINE_ID: string;
  GOOGLE_SEARCH_QUOTA_LIMIT?: string;
}

// Rate limiting types
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
}

export interface RequestCount {
  count: number;
  resetTime: number;
}

// Error types
export interface ApiError {
  success: false;
  error: string;
  timestamp: string;
  source: string;
  code?: number;
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

