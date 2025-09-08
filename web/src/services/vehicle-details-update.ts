import { supabase } from '@/lib/supabase'

export interface VehicleDetailsUpdateOptions {
  manufacturer: string
  model: string
  trim?: string
  year?: number
}

export interface VehicleDetailsUpdateResult {
  success: boolean
  message: string
  data: {
    manufacturer_created: number
    manufacturer_updated: number
    vehicles_created: number
    vehicles_updated: number
    specifications_created: number
    specifications_updated: number
    news_articles_added: number
    news_articles_skipped: number
    trims_processed: string[]
    vehicle_ids: string[]
    model_year_processed: string
  }
  timestamp: string
  source: string
  error?: string
}

export class VehicleDetailsUpdateService {
  /**
   * Update vehicle details by calling the mcp-server edge function
   */
  static async updateVehicleDetails(options: VehicleDetailsUpdateOptions): Promise<VehicleDetailsUpdateResult> {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('User not authenticated:', authError)
        return {
          success: false,
          message: 'Please log in to use this feature',
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
          source: 'vehicle-details-update-service',
          error: 'User not authenticated'
        }
      }

      console.log('Calling mcp-server function for vehicle details update:', {
        manufacturer: options.manufacturer,
        model: options.model,
        trim: options.trim,
        year: options.year
      })
      
      const { data, error } = await supabase.functions.invoke('mcp-server', {
        body: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'update-vehicle-details',
            arguments: {
              manufacturer: options.manufacturer,
              model: options.model,
              trim: options.trim,
              year: options.year
            }
          }
        }
      })

      if (error) {
        console.error('Error calling mcp-server function:', error)
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          context: error.context
        })
        
        // Try to get the actual error response from the server
        let serverError = null
        try {
          if (error.context && error.context.body) {
            serverError = JSON.parse(error.context.body)
            console.log('Server error response:', serverError)
          }
        } catch (parseError) {
          console.log('Could not parse server error response')
        }
        
        let errorMessage = 'Failed to update vehicle details'
        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.'
        } else if (error.status === 403) {
          errorMessage = 'Admin privileges required. Only administrators can update vehicle details.'
        } else if (error.status === 400) {
          errorMessage = serverError?.error || 'Invalid request. Please check the vehicle details.'
        }
        
        return {
          success: false,
          message: errorMessage,
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
          source: 'vehicle-details-update-service',
          error: serverError?.error || error.message
        }
      }

      console.log('MCP server result:', data)

      // Parse the JSON-RPC 2.0 response
      if (!data) {
        return {
          success: false,
          message: 'No response from mcp-server function',
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
          source: 'vehicle-details-update-service',
          error: 'No response data received'
        }
      }

      // Check for JSON-RPC error
      if (data.error) {
        console.error('JSON-RPC error:', data.error)
        return {
          success: false,
          message: data.error.data || 'MCP server error',
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
          source: 'vehicle-details-update-service',
          error: data.error.message || 'Unknown JSON-RPC error'
        }
      }

      // Extract result from JSON-RPC response
      if (!data.result || !data.result.content || !data.result.content[0] || !data.result.content[0].text) {
        return {
          success: false,
          message: 'Invalid response format',
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
          source: 'vehicle-details-update-service',
          error: 'Invalid response format from mcp-server'
        }
      }

      // Parse the actual result from the content text
      try {
        const result = JSON.parse(data.result.content[0].text)
        return result as VehicleDetailsUpdateResult
      } catch (parseError) {
        console.error('Error parsing mcp-server result:', parseError)
        return {
          success: false,
          message: 'Response parsing failed',
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
          source: 'vehicle-details-update-service',
          error: 'Failed to parse mcp-server response'
        }
      }
    } catch (error) {
      console.error('Error in VehicleDetailsUpdateService.updateVehicleDetails:', error)
      return {
        success: false,
        message: 'Vehicle details update failed',
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
        source: 'vehicle-details-update-service',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
