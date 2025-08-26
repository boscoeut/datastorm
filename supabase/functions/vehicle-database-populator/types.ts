// Type definitions for Vehicle Database Populator Edge Function

export interface Manufacturer {
  id?: string;
  name: string;
  country?: string;
  website?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id?: string;
  manufacturer_id: string;
  model: string;
  year: number;
  trim?: string;
  body_style?: string;
  is_electric: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleSpecification {
  id?: string;
  vehicle_id: string;
  battery_capacity_kwh?: number;
  range_miles?: number;
  power_hp?: number;
  torque_lb_ft?: number;
  acceleration_0_60?: number;
  top_speed_mph?: number;
  weight_lbs?: number;
  length_inches?: number;
  width_inches?: number;
  height_inches?: number;
  cargo_capacity_cu_ft?: number;
  seating_capacity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GeminiVehicleResponse {
  manufacturer: {
    name: string;
    country?: string;
    website?: string;
  };
  vehicle: {
    model: string;
    year: number;
    trim?: string;
    body_style?: string;
    is_electric: boolean;
  };
  specifications: {
    battery_capacity_kwh?: number;
    range_miles?: number;
    power_hp?: number;
    torque_lb_ft?: number;
    acceleration_0_60?: number;
    top_speed_mph?: number;
    weight_lbs?: number;
    length_inches?: number;
    width_inches?: number;
    height_inches?: number;
    cargo_capacity_cu_ft?: number;
    seating_capacity?: number;
  };
}

export interface VehiclePopulationRequest {
  action: 'populate' | 'single';
  limit?: number;
  manufacturer?: string;
  year?: number;
  body_style?: string;
}

export interface VehiclePopulationResponse {
  success: boolean;
  message: string;
  data?: {
    manufacturers_created: number;
    vehicles_created: number;
    specifications_created: number;
    total_processed: number;
    duplicates_skipped: number;
    vehicles: Vehicle[];
  };
  error?: string;
  timestamp: string;
  source: 'google-gemini';
}

export interface DatabaseInsertResult {
  success: boolean;
  inserted: number;
  errors: string[];
}

export interface ManufacturerInsertResult {
  success: boolean;
  manufacturer_id: string;
  error?: string;
}

export interface VehicleInsertResult {
  success: boolean;
  vehicle_id: string;
  isExisting?: boolean;
  error?: string;
}

export interface SpecificationInsertResult {
  success: boolean;
  specification_id: string;
  error?: string;
}

// Environment variables interface
export interface EnvironmentVariables {
  GOOGLE_GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// API request/response types
export interface ApiError {
  success: false;
  error: string;
  timestamp?: string;
  source?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
  source: string;
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

// CORS configuration
export interface CorsConfig {
  allowOrigin: string;
  allowMethods: HttpMethod[];
  allowHeaders: string[];
}
