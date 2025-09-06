import { VehicleImageService } from '../services/storage'

/**
 * Initialize Supabase storage buckets and policies
 * This should be called when the app starts
 */
export async function initializeStorage() {
  try {
    console.log('Initializing Supabase storage...')
    await VehicleImageService.initializeStorage()
    console.log('Storage initialization complete')
  } catch (error) {
    console.warn('Storage initialization completed with warnings:', error instanceof Error ? error.message : 'Unknown error')
    // Don't throw - storage might not be critical for app startup
  }
}

/**
 * Check if storage is properly configured
 */
export async function checkStorageStatus() {
  try {
    // Try to list buckets to check if storage is accessible
    const { data: buckets, error } = await VehicleImageService['supabase'].storage.listBuckets()
    if (error) throw error
    
    const vehicleImagesBucket = buckets.find(bucket => bucket.name === 'vehicle-images')
    return {
      available: true,
      bucketExists: !!vehicleImagesBucket,
      bucketName: 'vehicle-images'
    }
  } catch (error) {
    return {
      available: false,
      bucketExists: false,
      bucketName: 'vehicle-images',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
