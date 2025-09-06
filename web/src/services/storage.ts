import { supabase } from '../lib/supabase'
import type { VehicleImage } from '../types/database'

export interface ImageUploadResult {
  success: boolean
  imageUrl?: string
  imagePath?: string
  error?: string
  metadata?: {
    width: number
    height: number
    fileSize: number
    mimeType: string
  }
}

export interface ImageUploadOptions {
  file: File
  vehicleId: string
  imageType: 'profile' | 'gallery'
  altText?: string
  displayOrder?: number
}

export class VehicleImageService {
  private static readonly BUCKET_NAME = 'vehicle-images'
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpeg', 'image/png', 'image/webp']

  /**
   * Check if current user is admin
   */
  private static async checkAdminPermission(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id })
      if (error) {
        console.error('Error checking admin permission:', error)
        return false
      }
      return data === true
    } catch (error) {
      console.error('Error checking admin permission:', error)
      return false
    }
  }

  /**
   * Initialize storage bucket if it doesn't exist
   */
  static async initializeStorage(): Promise<void> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      if (error) {
        console.warn('Could not list storage buckets:', error.message)
        // If we can't list buckets, assume the bucket exists and continue
        return
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME)
      if (!bucketExists) {
        console.log(`Creating storage bucket: ${this.BUCKET_NAME}`)
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: this.MAX_FILE_SIZE,
          allowedMimeTypes: this.ALLOWED_TYPES
        })
        if (createError) {
          // If bucket creation fails, it might already exist or there might be permission issues
          console.warn(`Could not create bucket ${this.BUCKET_NAME}:`, createError.message)
          // Don't throw - the bucket might already exist
        } else {
          console.log(`Successfully created bucket: ${this.BUCKET_NAME}`)
        }
      } else {
        console.log(`Storage bucket ${this.BUCKET_NAME} already exists`)
      }
    } catch (error) {
      console.warn('Storage initialization warning:', error instanceof Error ? error.message : 'Unknown error')
      // Don't throw - storage might not be critical for app startup
    }
  }

  /**
   * Upload a vehicle image
   */
  static async uploadImage(options: ImageUploadOptions): Promise<ImageUploadResult> {
    try {
      // Check admin permission
      const isAdmin = await this.checkAdminPermission()
      if (!isAdmin) {
        return {
          success: false,
          error: 'Only administrators can upload vehicle images'
        }
      }

      // Validate file
      if (!this.validateFile(options.file)) {
        return {
          success: false,
          error: 'Invalid file type or size'
        }
      }

      // Generate file path
      const filePath = this.generateFilePath(options.vehicleId, options.imageType, options.file.name)
      
      // Upload file to storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, options.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      // Get image metadata
      const metadata = await this.getImageMetadata(options.file)

      // Save image record to database
      if (options.imageType === 'gallery') {
        await this.saveGalleryImage({
          vehicleId: options.vehicleId,
          imageUrl: urlData.publicUrl,
          imagePath: filePath,
          imageName: options.file.name,
          imageType: options.file.type,
          fileSize: options.file.size,
          width: metadata.width,
          height: metadata.height,
          altText: options.altText,
          displayOrder: options.displayOrder || 0
        })
      }

      return {
        success: true,
        imageUrl: urlData.publicUrl,
        imagePath: filePath,
        metadata
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * Upload profile image and update vehicle record
   */
  static async uploadProfileImage(vehicleId: string, file: File): Promise<ImageUploadResult> {
    try {
      const result = await this.uploadImage({
        file,
        vehicleId,
        imageType: 'profile'
      })

      if (result.success && result.imageUrl && result.imagePath) {
        // Update vehicle profile image
        const { error } = await supabase
          .from('vehicles')
          .update({
            profile_image_url: result.imageUrl,
            profile_image_path: result.imagePath
          })
          .eq('id', vehicleId)

        if (error) throw error
      }

      return result
    } catch (error) {
      console.error('Failed to upload profile image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile image upload failed'
      }
    }
  }

  /**
   * Get vehicle gallery images
   */
  static async getVehicleImages(vehicleId: string): Promise<VehicleImage[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_vehicle_images', { p_vehicle_id: vehicleId })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get vehicle images:', error)
      return []
    }
  }

  /**
   * Delete a gallery image
   */
  static async deleteGalleryImage(imageId: string, imagePath: string): Promise<boolean> {
    try {
      // Check admin permission
      const isAdmin = await this.checkAdminPermission()
      if (!isAdmin) {
        console.error('Only administrators can delete vehicle images')
        return false
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([imagePath])

      if (storageError) throw storageError

      // Soft delete from database
      const { error: dbError } = await supabase
        .from('vehicle_images')
        .update({ is_active: false })
        .eq('id', imageId)

      if (dbError) throw dbError

      return true
    } catch (error) {
      console.error('Failed to delete gallery image:', error)
      return false
    }
  }

  /**
   * Reorder gallery images
   */
  static async reorderImages(vehicleId: string, imageOrders: Array<{ id: string; order: number }>): Promise<boolean> {
    try {
      // Check admin permission
      const isAdmin = await this.checkAdminPermission()
      if (!isAdmin) {
        console.error('Only administrators can reorder vehicle images')
        return false
      }

      const { error } = await supabase
        .rpc('reorder_vehicle_images', {
          p_vehicle_id: vehicleId,
          p_image_orders: imageOrders
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to reorder images:', error)
      return false
    }
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): boolean {
    if (file.size > this.MAX_FILE_SIZE) {
      return false
    }
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return false
    }
    return true
  }

  /**
   * Generate file path for storage
   */
  private static generateFilePath(vehicleId: string, imageType: 'profile' | 'gallery', fileName: string): string {
    const timestamp = Date.now()
    const sanitizedFileName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    if (imageType === 'profile') {
      return `vehicles/${vehicleId}/profile/${sanitizedFileName}`
    } else {
      return `vehicles/${vehicleId}/gallery/${sanitizedFileName}`
    }
  }

  /**
   * Get image metadata (dimensions, etc.)
   */
  private static async getImageMetadata(file: File): Promise<{ width: number; height: number; fileSize: number; mimeType: string }> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.width,
          height: img.height,
          fileSize: file.size,
          mimeType: file.type
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: 0,
          height: 0,
          fileSize: file.size,
          mimeType: file.type
        })
      }
      
      img.src = url
    })
  }

  /**
   * Save gallery image to database
   */
  private static async saveGalleryImage(imageData: {
    vehicleId: string
    imageUrl: string
    imagePath: string
    imageName: string
    imageType: string
    fileSize: number
    width: number
    height: number
    altText?: string
    displayOrder: number
  }): Promise<void> {
    const { error } = await supabase
      .from('vehicle_images')
      .insert([{
        vehicle_id: imageData.vehicleId,
        image_url: imageData.imageUrl,
        image_path: imageData.imagePath,
        image_name: imageData.imageName,
        image_type: imageData.imageType,
        file_size: imageData.fileSize,
        width: imageData.width,
        height: imageData.height,
        alt_text: imageData.altText,
        display_order: imageData.displayOrder
      }])

    if (error) throw error
  }

  /**
   * Set a gallery image as the profile image
   */
  static async setGalleryImageAsProfile(vehicleId: string, imageUrl: string, imagePath: string): Promise<boolean> {
    try {
      // Check admin permission
      const isAdmin = await this.checkAdminPermission()
      if (!isAdmin) {
        console.error('Only administrators can set profile images')
        return false
      }

      // Update the vehicle's profile image
      const { error } = await supabase
        .from('vehicles')
        .update({
          profile_image_url: imageUrl,
          profile_image_path: imagePath
        })
        .eq('id', vehicleId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to set profile image:', error)
      return false
    }
  }
}
