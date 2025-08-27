// @ts-ignore -- Deno environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Import types
import type {
  Vehicle,
  VehicleWithDetails,
  VehicleImage,
  Manufacturer,
  GeminiImageGenerationResponse,
  GeneratedImage,
  ImageStorageResult,
  VehicleImageUpdateResult,
  ProcessResult,
  DatabaseInsertResult
} from './types.ts';

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(
  Deno.env.get('GOOGLE_GEMINI_API_KEY') || '',
);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const CONFIG = {
  IMAGES_PER_VEHICLE: 3,
  MAX_CONCURRENT_REQUESTS: 2,
  REQUEST_DELAY_MS: 1000, // 1 second delay between requests to respect rate limits
  STORAGE_BUCKET: 'vehicle-images',
  IMAGE_QUALITY: 'high',
  MAX_RETRIES: 3
};

// Prompt for searching vehicle images
const VEHICLE_IMAGE_SEARCH_PROMPT = (vehicle: VehicleWithDetails, imageType: 'profile' | 'gallery') => {
  const manufacturer = vehicle.manufacturer?.name || 'Unknown Manufacturer';
  const bodyStyle = vehicle.body_style || 'vehicle';
  
  if (imageType === 'profile') {
    return `Search for a high-quality, professional profile image of a ${vehicle.year} ${manufacturer} ${vehicle.model} ${vehicle.trim || ''} ${bodyStyle}. 
    
Requirements:
- This should be a clean, professional profile shot
- Highlight the vehicle's design and features
- Professional lighting and composition
- High resolution and quality
- Suitable for a vehicle database profile
- Must be an existing, real image (not AI generated)

Search for an image that showcases the ${vehicle.year} ${manufacturer} ${vehicle.model} in its best light.

Return the image URL only, no other text.
`;
  } else {
    return `Search for 3 high-quality, diverse images of a ${vehicle.year} ${manufacturer} ${vehicle.model} ${vehicle.trim || ''} ${bodyStyle} for a gallery.
    
Requirements for each image:
1. **Exterior Shot**: Beautiful exterior view showing the vehicle's design
2. **Feature Highlight**: Close-up of a key feature (headlights, wheels, interior, etc.)
3. **Lifestyle Shot**: Vehicle in a realistic setting (parked, on road, etc.)

Each image should:
- Be high resolution and professional quality
- Show different angles and perspectives
- Highlight the vehicle's unique features
- Be suitable for a vehicle gallery display
- Have professional lighting and composition
- Must be existing, real images (not AI generated)

Search for 3 distinct, high-quality images that showcase the ${vehicle.year} ${manufacturer} ${vehicle.model} from different perspectives.`;
  }
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate unique filename
const generateImageFilename = (vehicleId: string, imageType: string, index: number, extension: string = 'jpg') => {
  const timestamp = Date.now();
  return `${vehicleId}_${imageType}_${index}_${timestamp}.${extension}`;
};

// Helper function to check if vehicle needs images
const vehicleNeedsImages = (vehicle: VehicleWithDetails): boolean => {
  // Check if profile image is missing
  const hasProfileImage = vehicle.profile_image_url && vehicle.profile_image_path;
  
  // Check if gallery images exist
  const hasGalleryImages = vehicle.images && vehicle.images.length > 0;
  
  return !hasProfileImage || !hasGalleryImages;
};

// Function to retrieve all vehicles from database
async function getAllVehicles(): Promise<VehicleWithDetails[]> {
  try {
    console.log('Fetching all vehicles from database...');
    
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        manufacturer:manufacturers(*),
        images:vehicle_images(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Retrieved ${vehicles?.length || 0} vehicles`);
    return vehicles.slice(0, 1) || [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
}

// Function to search for vehicle images using Gemini web search
async function searchVehicleImages(
  vehicle: VehicleWithDetails, 
  imageType: 'profile' | 'gallery'
): Promise<GeminiImageGenerationResponse> {
  try {
    console.log(`Searching for ${imageType} images for ${vehicle.year} ${vehicle.manufacturer?.name || 'Unknown'} ${vehicle.model}`);
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const prompt = VEHICLE_IMAGE_SEARCH_PROMPT(vehicle, imageType);
    
    console.log('Prompt:', prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response to extract image URLs from web search results
    console.log(`Search results for ${vehicle.model}:`, text.substring(0, 300) + '...');
    
    // Extract image URLs from the search results
    // Look for URLs that appear to be image files
    const imageUrlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|webp|gif)(\?[^\s<>"{}|\\^`\[\]]*)?/gi;
    const foundUrls = text.match(imageUrlRegex) || [];
    
    // Filter and deduplicate URLs
    const uniqueUrls = [...new Set(foundUrls)].slice(0, imageType === 'profile' ? 1 : CONFIG.IMAGES_PER_VEHICLE);
    
    if (uniqueUrls.length === 0) {
      console.log(`No image URLs found for ${vehicle.model}`);
      return {
        success: false,
        images: [],
        error: 'No suitable images found in search results'
      };
    }
    
    // Create image objects from found URLs
    const foundImages: GeneratedImage[] = uniqueUrls.map((url, index) => ({
      url: url as string,
      altText: `${vehicle.year} ${vehicle.manufacturer?.name || 'Unknown'} ${vehicle.model} ${imageType} image ${index + 1}`,
      imageType: imageType,
      displayOrder: index + 1
    }));
    
    console.log(`Found ${foundImages.length} images for ${vehicle.model}`);
    
    return {
      success: true,
      images: foundImages
    };
    
  } catch (error) {
    console.error(`Error generating images for ${vehicle.model}:`, error);
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to download and store image
async function downloadAndStoreImage(
  imageUrl: string, 
  vehicleId: string, 
  imageType: string, 
  displayOrder: number
): Promise<ImageStorageResult> {
  try {
    console.log(`Downloading image: ${imageUrl}`);
    
    // In a real implementation, you would:
    // 1. Download the image from the URL
    // 2. Validate the image format and size
    // 3. Optimize the image if needed
    // 4. Upload to Supabase Storage
    
    // For now, we'll simulate the process
    const imageName = generateImageFilename(vehicleId, imageType, displayOrder);
    const imagePath = `${vehicleId}/${imageName}`;
    
    // Simulate image download and storage
    await delay(500); // Simulate processing time
    
    // In real implementation, upload to Supabase Storage here
    // const { data, error } = await supabase.storage
    //   .from(CONFIG.STORAGE_BUCKET)
    //   .upload(imagePath, imageBlob, {
    //     contentType: 'image/jpeg',
    //     upsert: false
    //   });
    
    const generatedImageUrl = `${supabaseUrl}/storage/v1/object/public/${CONFIG.STORAGE_BUCKET}/${imagePath}`;
    
    return {
      success: true,
      imagePath,
      imageUrl: generatedImageUrl,
      imageName
    };
    
  } catch (error) {
    console.error(`Error storing image:`, error);
    return {
      success: false,
      imagePath: '',
      imageUrl: '',
      imageName: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to update database with new image references
async function updateVehicleImages(
  vehicleId: string, 
  images: GeneratedImage[]
): Promise<VehicleImageUpdateResult> {
  try {
    console.log(`Updating database for vehicle ${vehicleId} with ${images.length} images`);
    
    const errors: string[] = [];
    let imagesProcessed = 0;
    
    for (const image of images) {
      try {
        // Download and store the image
        const storageResult = await downloadAndStoreImage(
          image.url, 
          vehicleId, 
          image.imageType, 
          image.displayOrder
        );
        
        if (storageResult.success) {
          // Insert image record into database
          const { error: dbError } = await supabase
            .from('vehicle_images')
            .insert({
              vehicle_id: vehicleId,
              image_url: storageResult.imageUrl,
              image_path: storageResult.imagePath,
              image_name: storageResult.imageName,
              image_type: image.imageType,
              display_order: image.displayOrder,
              alt_text: image.altText,
              is_active: true
            });
          
          if (dbError) {
            errors.push(`Database error for image ${image.displayOrder}: ${dbError.message}`);
          } else {
            imagesProcessed++;
          }
        } else {
          errors.push(`Storage error for image ${image.displayOrder}: ${storageResult.error}`);
        }
        
        // Add delay between requests to respect rate limits
        await delay(CONFIG.REQUEST_DELAY_MS);
        
      } catch (error) {
        errors.push(`Processing error for image ${image.displayOrder}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return {
      vehicleId,
      success: imagesProcessed > 0,
      imagesProcessed,
      errors
    };
    
  } catch (error) {
    console.error(`Error updating vehicle images for ${vehicleId}:`, error);
    return {
      vehicleId,
      success: false,
      imagesProcessed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Main function to process all vehicles
async function processAllVehicles(): Promise<ProcessResult> {
  try {
    console.log('Starting vehicle image population process...');
    
    const vehicles = await getAllVehicles();
    const vehiclesNeedingImages = vehicles.filter(vehicleNeedsImages);
    
    console.log(`Found ${vehiclesNeedingImages.length} vehicles needing images out of ${vehicles.length} total`);
    
    const result: ProcessResult = {
      totalVehicles: vehicles.length,
      vehiclesProcessed: 0,
      vehiclesWithNewImages: 0,
      totalImagesGenerated: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };
    
    // Process vehicles in batches to respect rate limits
    for (let i = 0; i < vehiclesNeedingImages.length; i += CONFIG.MAX_CONCURRENT_REQUESTS) {
      const batch = vehiclesNeedingImages.slice(i, i + CONFIG.MAX_CONCURRENT_REQUESTS);
      
      const batchPromises = batch.map(async (vehicle) => {
        try {
          result.vehiclesProcessed++;
          
          // Check what images are needed
          const needsProfileImage = !vehicle.profile_image_url && !vehicle.profile_image_path;
          const needsGalleryImages = !vehicle.images || vehicle.images.length === 0;
          
          let totalImagesForVehicle = 0;
          
          // Search for profile image if needed
          if (needsProfileImage) {
            const profileResult = await searchVehicleImages(vehicle, 'profile');
            if (profileResult.success && profileResult.images.length > 0) {
              const updateResult = await updateVehicleImages(vehicle.id, profileResult.images);
              if (updateResult.success) {
                totalImagesForVehicle += updateResult.imagesProcessed;
              }
              result.errors.push(...updateResult.errors);
            }
          }
          
          // Search for gallery images if needed
          if (needsGalleryImages) {
            const galleryResult = await searchVehicleImages(vehicle, 'gallery');
            if (galleryResult.success && galleryResult.images.length > 0) {
              const updateResult = await updateVehicleImages(vehicle.id, galleryResult.images);
              if (updateResult.success) {
                totalImagesForVehicle += updateResult.imagesProcessed;
              }
              result.errors.push(...updateResult.errors);
            }
          }
          
          if (totalImagesForVehicle > 0) {
            result.vehiclesWithNewImages++;
            result.totalImagesGenerated += totalImagesForVehicle;
          }
          
          console.log(`Processed ${vehicle.model}: ${totalImagesForVehicle} images found`);
          
        } catch (error) {
          const errorMsg = `Error processing vehicle ${vehicle.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      });
      
      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Add delay between batches to respect rate limits
      if (i + CONFIG.MAX_CONCURRENT_REQUESTS < vehiclesNeedingImages.length) {
        console.log(`Waiting ${CONFIG.REQUEST_DELAY_MS}ms before processing next batch...`);
        await delay(CONFIG.REQUEST_DELAY_MS);
      }
    }
    
    console.log('Vehicle image population process completed');
    console.log('Results:', result);
    
    return result;
    
  } catch (error) {
    console.error('Error in main process:', error);
    throw error;
  }
}

// HTTP handler for the edge function
serve(async (req: Request) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed. Use POST to trigger the image population process.' 
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Check authorization (you can add your own auth logic here)
    const authHeader = req.headers.get('Authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return new Response(JSON.stringify({ 
    //     error: 'Unauthorized. Valid Bearer token required.' 
    //   }), {
    //     status: 401,
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Access-Control-Allow-Origin': '*',
    //     },
    //   });
    // }
    
    console.log('Starting vehicle image population process...');
    
    // Process all vehicles
    const result = await processAllVehicles();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Vehicle image population process completed successfully',
      result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

