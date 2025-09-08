import { supabase } from '@/lib/supabase';

export interface VehicleUpdateParams {
  manufacturer: string;
  model: string;
  trim?: string;
  year?: number;
}

export interface VehicleUpdateResult {
  success: boolean;
  message: string;
  data: {
    manufacturer_created: number;
    manufacturer_updated: number;
    vehicles_created: number;
    vehicles_updated: number;
    specifications_created: number;
    specifications_updated: number;
    news_articles_added: number;
    news_articles_skipped: number;
    trims_processed: string[];
    vehicle_ids: string[];
    model_year_processed: string;
  };
  timestamp: string;
  source: string;
  error?: string;
}

export class VehicleUpdateService {
  /**
   * Update vehicle details using the MCP server
   */
  static async updateVehicleDetails(params: VehicleUpdateParams): Promise<VehicleUpdateResult> {
    try {
      console.log('🚗 Calling MCP server to update vehicle details:', params);

      // Call the MCP server edge function using JSON-RPC format
      const { data, error } = await supabase.functions.invoke('mcp-server', {
        body: {
          jsonrpc: '2.0',
          id: Date.now().toString(),
          method: 'tools/call',
          params: {
            name: 'update-vehicle-details',
            arguments: {
              manufacturer: params.manufacturer,
              model: params.model,
              trim: params.trim,
              year: params.year
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
      let result: VehicleUpdateResult;
      
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

      console.log('✅ Vehicle update completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Error updating vehicle details:', error);
      
      // Return a structured error response
      return {
        success: false,
        message: 'Failed to update vehicle details',
        data: {
          manufacturer_created: 0,
          manufacturer_updated: 0,
          vehicles_created: 0,
          vehicles_updated: 0,
          specifications_created: 0,
          specifications_updated: 0,
          news_articles_added: 0,
          news_articles_skipped: 0,
          trims_processed: [],
          vehicle_ids: [],
          model_year_processed: ''
        },
        timestamp: new Date().toISOString(),
        source: 'vehicle-update-service',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate vehicle update parameters
   */
  static validateParams(params: Partial<VehicleUpdateParams>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.manufacturer || params.manufacturer.trim() === '') {
      errors.push('Manufacturer is required');
    }

    if (!params.model || params.model.trim() === '') {
      errors.push('Model is required');
    }

    if (params.year && (params.year < 1900 || params.year > new Date().getFullYear() + 2)) {
      errors.push('Year must be between 1900 and ' + (new Date().getFullYear() + 2));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
