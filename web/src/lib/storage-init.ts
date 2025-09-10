import { VehicleImageService } from '../services/storage'
import { NewsImageService } from '../services/news-image-storage'

/**
 * Initialize Supabase storage buckets and policies
 * This should be called when the app starts
 */
export async function initializeStorage() {
  try {
    console.log('Initializing Supabase storage...')
    await VehicleImageService.initializeStorage()
    await NewsImageService.initializeStorage()
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
    const newsImagesBucket = buckets.find(bucket => bucket.name === 'news-images')
    
    return {
      available: true,
      vehicleImagesBucket: !!vehicleImagesBucket,
      newsImagesBucket: !!newsImagesBucket,
      buckets: buckets.map(b => b.name)
    }
  } catch (error) {
    return {
      available: false,
      vehicleImagesBucket: false,
      newsImagesBucket: false,
      buckets: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
