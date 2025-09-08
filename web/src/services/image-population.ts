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
   * Populate vehicle images by calling the server-side edge function
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

      console.log('Calling populate-images function for user:', user.id)
      console.log('Request options:', {
        vehicleId: options.vehicleId,
        model: options.model,
        trim: options.trim,
        manufacturer: options.manufacturer,
        maxImages: options.maxImages || 10
      })
      
      const { data, error } = await supabase.functions.invoke('populate-images', {
        body: {
          vehicleId: options.vehicleId,
          model: options.model,
          trim: options.trim,
          manufacturer: options.manufacturer,
          maxImages: options.maxImages || 10
        }
      })

      if (error) {
        console.error('Error calling populate-images function:', error)
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

      console.log('Populate images result:', data)
      return data as ImagePopulationResult
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
