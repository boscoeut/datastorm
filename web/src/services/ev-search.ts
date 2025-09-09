import { supabase } from '@/lib/supabase';

export interface ExtractedVehicle {
  manufacturer: string;
  model: string;
  year?: number;
  trim?: string;
  source: string;
  url: string;
}

export interface EVSearchResult {
  success: boolean;
  message: string;
  foundVehicles: ExtractedVehicle[];
  missingVehicles: ExtractedVehicle[];
  totalSearched: number;
  searchQuery?: string;
  manufacturer?: string;
  model?: string;
  trim?: string;
  year?: number;
  timestamp: string;
  source: string;
  error?: string;
}

export interface EVSearchParams {
  manufacturer: string;
  model?: string;
  trim?: string;
  year?: number;
  includeAllTrims?: boolean;
  maxResults?: number;
}

export class EVSearchService {
  /**
   * Search for Electric Vehicles using the MCP server
   */
  static async searchEVs(params: EVSearchParams): Promise<EVSearchResult> {
    try {
      console.log('🔍 Calling MCP server to search for EVs:', params);

      // Call the MCP server edge function using JSON-RPC format
      const { data, error } = await supabase.functions.invoke('mcp-server', {
        body: {
          jsonrpc: '2.0',
          id: Date.now().toString(),
          method: 'tools/call',
          params: {
            name: 'search-evs',
            arguments: {
              manufacturer: params.manufacturer,
              model: params.model,
              trim: params.trim,
              year: params.year,
              includeAllTrims: params.includeAllTrims,
              maxResults: params.maxResults
            }
          }
        }
      });

      if (error) {
        console.error('❌ MCP server error:', error);
        throw new Error(`MCP server error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from MCP server');
      }

      // Parse the JSON-RPC response
      let result: EVSearchResult;
      
      if (data.result && data.result.content && data.result.content[0]) {
        // MCP server returns result in content[0].text
        const resultText = data.result.content[0].text;
        result = JSON.parse(resultText);
      } else if (data.error) {
        // Handle JSON-RPC error response
        throw new Error(`MCP server error: ${data.error.message} - ${data.error.data || ''}`);
      } else {
        // Fallback: assume data is the result directly
        result = data;
      }

      console.log('✅ EV search completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Error searching for EVs:', error);
      
      // Return a structured error response
      return {
        success: false,
        message: 'Failed to search for electric vehicles',
        foundVehicles: [],
        missingVehicles: [],
        totalSearched: 0,
        timestamp: new Date().toISOString(),
        source: 'ev-search-service',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate search parameters
   */
  static validateParams(params: Partial<EVSearchParams>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.manufacturer || params.manufacturer.trim() === '') {
      errors.push('Manufacturer is required');
    }

    if (params.year && (params.year < 2020 || params.year > 2030)) {
      errors.push('Year must be between 2020 and 2030');
    }

    if (params.maxResults && (params.maxResults < 1 || params.maxResults > 50)) {
      errors.push('Max results must be between 1 and 50');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
