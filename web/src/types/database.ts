// Database type definitions for Electric Vehicle Data Hub
// These types match the Supabase database schema

export interface Manufacturer {
  id: string
  name: string
  country?: string
  website?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  manufacturer_id: string
  model: string
  year: number
  trim?: string
  body_style?: string
  is_electric: boolean
  created_at: string
  updated_at: string
  // Relations
  manufacturer?: Manufacturer
  specifications?: VehicleSpecification
}

export interface VehicleSpecification {
  id: string
  vehicle_id: string
  battery_capacity_kwh?: number
  range_miles?: number
  power_hp?: number
  torque_lb_ft?: number
  acceleration_0_60?: number
  top_speed_mph?: number
  weight_lbs?: number
  length_inches?: number
  width_inches?: number
  height_inches?: number
  cargo_capacity_cu_ft?: number
  seating_capacity?: number
  created_at: string
  updated_at: string
  // Relations
  vehicle?: Vehicle
}



export interface NewsArticle {
  id: string
  title: string
  content?: string
  summary?: string
  source_url?: string
  source_name?: string
  published_date?: string
  category?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  favorite_vehicles?: string[]
  search_history?: any
  filter_preferences?: any
  notification_settings?: any
  created_at: string
  updated_at: string
}

// Extended types for API responses
export interface VehicleWithDetails extends Vehicle {
  manufacturer: Manufacturer
  specifications: VehicleSpecification
}

export interface ManufacturerWithVehicles extends Manufacturer {
  vehicles: Vehicle[]
}

// Filter and search types
export interface VehicleFilters {
  manufacturer_id?: string
  year_min?: number
  year_max?: number
  body_style?: string
  is_electric?: boolean
  range_min?: number
  range_max?: number
  price_min?: number
  price_max?: number
}

export interface SearchFilters {
  query?: string
  category?: string
  tags?: string[]
  date_from?: string
  date_to?: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Real-time subscription types
export interface RealtimeSubscription {
  id: string
  table: string
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  callback: (payload: any) => void
}

// Database operation types
export type DatabaseOperation = 'create' | 'read' | 'update' | 'delete'

export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

// Utility types
export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  field: string
  direction: SortDirection
}

export interface PaginationOptions {
  page: number
  pageSize: number
  sortBy?: SortOption
}
