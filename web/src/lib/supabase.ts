import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export types for database schema
export type Database = {
  public: {
    Tables: {
      manufacturers: {
        Row: {
          id: string
          name: string
          country: string | null
          website: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          country?: string | null
          website?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string | null
          website?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          manufacturer_id: string
          model: string
          year: number
          trim: string | null
          body_style: string | null
          is_electric: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manufacturer_id: string
          model: string
          year: number
          trim?: string | null
          body_style?: string | null
          is_electric?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manufacturer_id?: string
          model?: string
          year?: number
          trim?: string | null
          body_style?: string | null
          is_electric?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_specifications: {
        Row: {
          id: string
          vehicle_id: string
          battery_capacity_kwh: number | null
          range_miles: number | null
          power_hp: number | null
          torque_lb_ft: number | null
          acceleration_0_60: number | null
          top_speed_mph: number | null
          weight_lbs: number | null
          length_inches: number | null
          width_inches: number | null
          height_inches: number | null
          cargo_capacity_cu_ft: number | null
          seating_capacity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          battery_capacity_kwh?: number | null
          range_miles?: number | null
          power_hp?: number | null
          torque_lb_ft?: number | null
          acceleration_0_60?: number | null
          top_speed_mph?: number | null
          weight_lbs?: number | null
          length_inches?: number | null
          width_inches?: number | null
          height_inches?: number | null
          cargo_capacity_cu_ft?: number | null
          seating_capacity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          battery_capacity_kwh?: number | null
          range_miles?: number | null
          power_hp?: number | null
          torque_lb_ft?: number | null
          acceleration_0_60?: number | null
          top_speed_mph?: number | null
          weight_lbs?: number | null
          length_inches?: number | null
          width_inches?: number | null
          height_inches?: number | null
          cargo_capacity_cu_ft?: number | null
          seating_capacity?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      news_articles: {
        Row: {
          id: string
          title: string
          content: string | null
          summary: string | null
          source_url: string | null
          source_name: string | null
          published_date: string | null
          category: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          summary?: string | null
          source_url?: string | null
          source_name?: string | null
          published_date?: string | null
          category?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          summary?: string | null
          source_url?: string | null
          source_name?: string | null
          published_date?: string | null
          category?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          favorite_vehicles: string[] | null
          search_history: any | null
          filter_preferences: any | null
          notification_settings: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorite_vehicles?: string[] | null
          search_history?: any | null
          filter_preferences?: any | null
          notification_settings?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favorite_vehicles?: string[] | null
          search_history?: any | null
          filter_preferences?: any | null
          notification_settings?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
