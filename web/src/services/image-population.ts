import { supabase } from '@/lib/supabase'

export interface ImagePopulationOptions {
  vehicleId: string
  model: string
  trim?: string
  manufacturer?: string
  maxImages?: number
}

export interface ImagePopulationResult {
  success: boolean
  imagesUploaded: number
  imagesSearched: number
  errors: string[]
  message: string
}

export class ImagePopulationService {
  /**
   * Populate vehicle images by calling the mcp-server edge function
   */
  static async populateVehicleImages(options: ImagePopulationOptions): Promise<ImagePopulationResult> {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('User not authenticated:', authError)
        return {
          success: false,
          imagesUploaded: 0,
          imagesSearched: 0,
          errors: ['User not authenticated'],
          message: 'Please log in to use this feature'
        }
      }

      console.log('Calling mcp-server function for user:', user.id)
      console.log('Request options:', {
        vehicleId: options.vehicleId,
        model: options.model,
        trim: options.trim,
        manufacturer: options.manufacturer,
        maxImages: options.maxImages || 10
      })
      
      const { data, error } = await supabase.functions.invoke('mcp-server', {
        body: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'populate-images',
            arguments: {
              vehicleId: options.vehicleId,
              model: options.model,
              trim: options.trim,
              manufacturer: options.manufacturer,
              maxImages: options.maxImages || 10
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
        
        let errorMessage = 'Failed to populate images'
        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.'
        } else if (error.status === 403) {
          errorMessage = 'Admin privileges required. Only administrators can populate images.'
        } else if (error.status === 400) {
          errorMessage = serverError?.error || 'Invalid request. Please check the vehicle details.'
        }
        
        return {
          success: false,
          imagesUploaded: 0,
          imagesSearched: 0,
          errors: [serverError?.error || error.message],
          message: errorMessage
        }
      }

      console.log('MCP server result:', data)

      // Parse the JSON-RPC 2.0 response
      if (!data) {
        return {
          success: false,
          imagesUploaded: 0,
          imagesSearched: 0,
          errors: ['No response data received'],
          message: 'No response from mcp-server function'
        }
      }

      // Check for JSON-RPC error
      if (data.error) {
        console.error('JSON-RPC error:', data.error)
        return {
          success: false,
          imagesUploaded: 0,
          imagesSearched: 0,
          errors: [data.error.message || 'Unknown JSON-RPC error'],
          message: data.error.data || 'MCP server error'
        }
      }

      // Extract result from JSON-RPC response
      if (!data.result || !data.result.content || !data.result.content[0] || !data.result.content[0].text) {
        return {
          success: false,
          imagesUploaded: 0,
          imagesSearched: 0,
          errors: ['Invalid response format from mcp-server'],
          message: 'Invalid response format'
        }
      }

      // Parse the actual result from the content text
      try {
        const result = JSON.parse(data.result.content[0].text)
        return result as ImagePopulationResult
      } catch (parseError) {
        console.error('Error parsing mcp-server result:', parseError)
        return {
          success: false,
          imagesUploaded: 0,
          imagesSearched: 0,
          errors: ['Failed to parse mcp-server response'],
          message: 'Response parsing failed'
        }
      }
    } catch (error) {
      console.error('Error in ImagePopulationService.populateVehicleImages:', error)
      return {
        success: false,
        imagesUploaded: 0,
        imagesSearched: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        message: 'Image population failed'
      }
    }
  }
}
