import { supabase } from '@/lib/supabase'
import type {
  Manufacturer,
  Vehicle,
  VehicleSpecification,
  NewsArticle,
  UserPreferences,
  VehicleFilters,
  SearchFilters,
  PaginationOptions,
  SortOption,
  DatabaseError
} from '@/types/database'

// Generic database service class
export class DatabaseService {
  // Error handling utility
  static handleError(error: any): DatabaseError {
    if (error?.message) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }
    }
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    }
  }

  // Generic CRUD operations
  static async create<T>(
    table: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: DatabaseError | null }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      if (error) {
        return { data: null, error: this.handleError(error) }
      }

      return { data: result as T, error: null }
    } catch (error) {
      return { data: null, error: this.handleError(error) }
    }
  }

  static async read<T>(
    table: string,
    id: string
  ): Promise<{ data: T | null; error: DatabaseError | null }> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: this.handleError(error) }
      }

      return { data: data as T, error: null }
    } catch (error) {
      return { data: null, error: this.handleError(error) }
    }
  }

  static async update<T>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: DatabaseError | null }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error: this.handleError(error) }
      }

      return { data: result as T, error: null }
    } catch (error) {
      return { data: null, error: this.handleError(error) }
    }
  }

  static async delete(
    table: string,
    id: string
  ): Promise<{ error: DatabaseError | null }> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) {
        return { error: this.handleError(error) }
      }

      return { error: null }
    } catch (error) {
      return { error: this.handleError(error) }
    }
  }

  static async list<T>(
    table: string,
    options?: {
      filters?: Record<string, any>
      pagination?: PaginationOptions
      sortBy?: SortOption
    }
  ): Promise<{ data: T[]; error: DatabaseError | null; count?: number }> {
    try {
      let query = supabase.from(table).select('*', { count: 'exact' })

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value)
            } else {
              query = query.eq(key, value)
            }
          }
        })
      }

      // Apply sorting
      if (options?.sortBy) {
        query = query.order(options.sortBy.field, {
          ascending: options.sortBy.direction === 'asc'
        })
      }

      // Apply pagination
      if (options?.pagination) {
        const { page, pageSize } = options.pagination
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        return { data: [], error: this.handleError(error) }
      }

      return { data: data as T[], error: null, count: count || undefined }
    } catch (error) {
      return { data: [], error: this.handleError(error) }
    }
  }
}

// Manufacturer service
export class ManufacturerService {
  static async create(manufacturer: Partial<Manufacturer>) {
    return DatabaseService.create<Manufacturer>('manufacturers', manufacturer)
  }

  static async getById(id: string) {
    return DatabaseService.read<Manufacturer>('manufacturers', id)
  }

  static async update(id: string, manufacturer: Partial<Manufacturer>) {
    return DatabaseService.update<Manufacturer>('manufacturers', id, manufacturer)
  }

  static async delete(id: string) {
    return DatabaseService.delete('manufacturers', id)
  }

  static async list(options?: {
    filters?: { country?: string }
    pagination?: PaginationOptions
    sortBy?: SortOption
  }) {
    return DatabaseService.list<Manufacturer>('manufacturers', options)
  }

  static async getWithVehicles(id: string) {
    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select(`
          *,
          vehicles (*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: DatabaseService.handleError(error) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: DatabaseService.handleError(error) }
    }
  }
}

// Vehicle service
export class VehicleService {
  static async create(vehicle: Partial<Vehicle>) {
    return DatabaseService.create<Vehicle>('vehicles', vehicle)
  }

  static async getById(id: string) {
    return DatabaseService.read<Vehicle>('vehicles', id)
  }

  static async update(id: string, vehicle: Partial<Vehicle>) {
    return DatabaseService.update<Vehicle>('vehicles', id, vehicle)
  }

  static async delete(id: string) {
    return DatabaseService.delete('vehicles', id)
  }

  static async list(options?: {
    filters?: VehicleFilters
    pagination?: PaginationOptions
    sortBy?: SortOption
  }) {
    return DatabaseService.list<Vehicle>('vehicles', options)
  }

  static async getWithDetails(id: string) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          manufacturer:manufacturers(*),
          specifications:vehicle_specifications(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: DatabaseService.handleError(error) }
      }

      // Transform the data to match the expected interface
      if (data && data.specifications && Array.isArray(data.specifications)) {
        // Take the first specification if it's an array
        data.specifications = data.specifications[0] || null
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: DatabaseService.handleError(error) }
    }
  }

  static async search(filters: VehicleFilters, options?: PaginationOptions) {
    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          manufacturer:manufacturers(*),
          specifications:vehicle_specifications(*)
        `, { count: 'exact' })

      // Apply filters
      if (filters.manufacturer_id) {
        query = query.eq('manufacturer_id', filters.manufacturer_id)
      }
      if (filters.year_min) {
        query = query.gte('year', filters.year_min)
      }
      if (filters.year_max) {
        query = query.lte('year', filters.year_max)
      }
      if (filters.body_style) {
        query = query.eq('body_style', filters.body_style)
      }
      if (filters.is_electric !== undefined) {
        query = query.eq('is_electric', filters.is_electric)
      }

      // Apply pagination
      if (options) {
        const { page, pageSize } = options
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        return { data: [], error: DatabaseService.handleError(error), count: 0 }
      }

      return { data: data || [], error: null, count }
    } catch (error) {
      return { data: [], error: DatabaseService.handleError(error), count: 0 }
    }
  }
}

// Vehicle Specification service
export class VehicleSpecificationService {
  static async create(spec: Partial<VehicleSpecification>) {
    return DatabaseService.create<VehicleSpecification>('vehicle_specifications', spec)
  }

  static async getById(id: string) {
    return DatabaseService.read<VehicleSpecification>('vehicle_specifications', id)
  }

  static async update(id: string, spec: Partial<VehicleSpecification>) {
    return DatabaseService.update<VehicleSpecification>('vehicle_specifications', id, spec)
  }

  static async delete(id: string) {
    return DatabaseService.delete('vehicle_specifications', id)
  }

  static async getByVehicleId(vehicleId: string) {
    try {
      const { data, error } = await supabase
        .from('vehicle_specifications')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .single()

      if (error) {
        return { data: null, error: DatabaseService.handleError(error) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: DatabaseService.handleError(error) }
    }
  }
}



// News Article service
export class NewsArticleService {
  static async create(article: Partial<NewsArticle>) {
    return DatabaseService.create<NewsArticle>('news_articles', article)
  }

  static async getById(id: string) {
    return DatabaseService.read<NewsArticle>('news_articles', id)
  }

  static async update(id: string, article: Partial<NewsArticle>) {
    return DatabaseService.update<NewsArticle>('news_articles', id, article)
  }

  static async delete(id: string) {
    return DatabaseService.delete('news_articles', id)
  }

  static async getLatest(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: [], error: DatabaseService.handleError(error) }
      }

      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: DatabaseService.handleError(error) }
    }
  }

  static async search(filters: SearchFilters, options?: PaginationOptions) {
    try {
      let query = supabase
        .from('news_articles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,summary.ilike.%${filters.query}%`)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }
      if (filters.date_from) {
        query = query.gte('published_date', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('published_date', filters.date_to)
      }

      // Apply pagination
      if (options) {
        const { page, pageSize } = options
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      // Default sorting by published date
      query = query.order('published_date', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        return { data: [], error: DatabaseService.handleError(error), count: 0 }
      }

      return { data: data || [], error: null, count }
    } catch (error) {
      return { data: [], error: DatabaseService.handleError(error), count: 0 }
    }
  }
}

// User Preferences service
export class UserPreferencesService {
  static async create(preferences: Partial<UserPreferences>) {
    return DatabaseService.create<UserPreferences>('user_preferences', preferences)
  }

  static async getByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        return { data: null, error: DatabaseService.handleError(error) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: DatabaseService.handleError(error) }
    }
  }

  static async updateByUserId(userId: string, preferences: Partial<UserPreferences>) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ ...preferences, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return { data: null, error: DatabaseService.handleError(error) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: DatabaseService.handleError(error) }
    }
  }

  static async addFavoriteVehicle(userId: string, vehicleId: string) {
    try {
      // Get current preferences
      const { data: currentPrefs } = await this.getByUserId(userId)
      
      if (!currentPrefs) {
        // Create new preferences if none exist
        return this.create({
          user_id: userId,
          favorite_vehicles: [vehicleId]
        })
      }

      // Add vehicle to favorites if not already there
      const currentFavorites = currentPrefs.favorite_vehicles || []
      if (!currentFavorites.includes(vehicleId)) {
        const updatedFavorites = [...currentFavorites, vehicleId]
        return this.updateByUserId(userId, {
          favorite_vehicles: updatedFavorites
        })
      }

      return { data: currentPrefs, error: null }
    } catch (error) {
      return { data: null, error: DatabaseService.handleError(error) }
    }
  }

  static async removeFavoriteVehicle(userId: string, vehicleId: string) {
    try {
      const { data: currentPrefs } = await this.getByUserId(userId)
      
      if (!currentPrefs) {
        return { data: null, error: { message: 'No preferences found' } }
      }

      const currentFavorites = currentPrefs.favorite_vehicles || []
             const updatedFavorites = currentFavorites.filter((id: string) => id !== vehicleId)
      
      return this.updateByUserId(userId, {
        favorite_vehicles: updatedFavorites
      })
    } catch (error) {
      return { data: null, error: DatabaseService.handleError(error) }
    }
  }
}


