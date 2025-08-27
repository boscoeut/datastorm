// Types for Vehicle Image Populator Edge Function

export interface Vehicle {
  id: string
  manufacturer_id: string
  model: string
  year: number
  trim?: string
  body_style?: string
  is_electric: boolean
  profile_image_url?: string
  profile_image_path?: string
  created_at: string
  updated_at: string
}

export interface VehicleImage {
  id: string
  vehicle_id: string
  image_url: string
  image_path: string
  image_name: string
  image_type?: string
  file_size?: number
  width?: number
  height?: number
  alt_text?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Manufacturer {
  id: string
  name: string
  country?: string
  website?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface VehicleWithDetails extends Vehicle {
  manufacturer?: Manufacturer
  images?: VehicleImage[]
}

export interface GeminiImageGenerationRequest {
  vehicle: VehicleWithDetails
  imageType: 'profile' | 'gallery'
  count: number
}

export interface GeminiImageGenerationResponse {
  success: boolean
  images: GeneratedImage[]
  error?: string
}

export interface GeneratedImage {
  url: string
  altText: string
  imageType: 'profile' | 'gallery'
  displayOrder: number
}

export interface ImageStorageResult {
  success: boolean
  imagePath: string
  imageUrl: string
  imageName: string
  error?: string
}

export interface VehicleImageUpdateResult {
  vehicleId: string
  success: boolean
  imagesProcessed: number
  errors: string[]
}

export interface ProcessResult {
  totalVehicles: number
  vehiclesProcessed: number
  vehiclesWithNewImages: number
  totalImagesGenerated: number
  errors: string[]
  timestamp: string
}

export interface DatabaseInsertResult {
  success: boolean
  data?: any
  error?: string
}

// Zod schemas for validation
export const VehicleSchema = {
  id: 'string',
  manufacturer_id: 'string',
  model: 'string',
  year: 'number',
  trim: 'string?',
  body_style: 'string?',
  is_electric: 'boolean',
  profile_image_url: 'string?',
  profile_image_path: 'string?',
  created_at: 'string',
  updated_at: 'string'
}

export const VehicleImageSchema = {
  id: 'string',
  vehicle_id: 'string',
  image_url: 'string',
  image_path: 'string',
  image_name: 'string',
  image_type: 'string?',
  file_size: 'number?',
  width: 'number?',
  height: 'number?',
  alt_text: 'string?',
  display_order: 'number',
  is_active: 'boolean',
  created_at: 'string',
  updated_at: 'string'
}
