import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { VehicleService } from '@/services/database'
import type { Vehicle, VehicleFilters, PaginationOptions, SortOption } from '@/types/database'

interface VehicleState {
  // Data
  vehicles: Vehicle[]
  manufacturers: { id: string; name: string }[]
  
  // UI State
  loading: boolean
  error: string | null
  
  // Search and Filtering
  searchQuery: string
  filters: VehicleFilters
  
  // Pagination
  pagination: PaginationOptions
  totalCount: number
  
  // Sorting
  sortBy: SortOption | null
}

interface VehicleActions {
  // Data fetching
  fetchVehicles: () => Promise<void>
  fetchManufacturers: () => Promise<void>
  
  // Search and filtering
  setSearchQuery: (query: string) => void
  updateFilters: (filters: Partial<VehicleFilters>) => void
  clearFilters: () => void
  
  // Pagination
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  
  // Sorting
  setSortBy: (sortBy: SortOption | null) => void
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

type VehicleStore = VehicleState & VehicleActions

const initialState: VehicleState = {
  vehicles: [],
  manufacturers: [],
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20
  },
  totalCount: 0,
  sortBy: null
}

export const useVehicleStore = create<VehicleStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Data fetching
            fetchVehicles: async () => {
        const { pagination, filters, sortBy } = get()
        
        set({ loading: true, error: null })
        
        try {
          // For now, we'll use the basic list method since search doesn't support text search yet
          // This will be enhanced in future tasks with proper search functionality
          const result = await VehicleService.list({
            filters,
            pagination,
            sortBy: sortBy || undefined
          })
          
          if (result.error) {
            set({ error: result.error.message, vehicles: [], totalCount: 0 })
          } else {
            set({ 
              vehicles: result.data || [], 
              totalCount: result.count || 0,
              error: null 
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch vehicles',
            vehicles: [], 
            totalCount: 0
          })
        } finally {
          set({ loading: false })
        }
      },

      fetchManufacturers: async () => {
        set({ loading: true, error: null })
        
        try {
          const result = await VehicleService.list({
            filters: { is_electric: true }, // Only get manufacturers with electric vehicles
            pagination: { page: 1, pageSize: 100 } // Get all manufacturers
          })
          
          if (result.error) {
            set({ error: result.error.message })
          } else {
            // Extract unique manufacturers from vehicles
            const manufacturers = Array.from(
              new Set(
                (result.data || [])
                  .map(v => v.manufacturer_id)
                  .filter(Boolean)
              )
            ).map(id => ({ id, name: id })) // We'll enhance this later
            
            set({ manufacturers, error: null })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch manufacturers'
          })
        } finally {
          set({ loading: false })
        }
      },

      // Search and filtering
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, pagination: { ...get().pagination, page: 1 } })
        // For now, search is just stored in state - will be implemented in future tasks
        // This provides the foundation for search functionality
      },

      updateFilters: (newFilters: Partial<VehicleFilters>) => {
        const currentFilters = get().filters
        const updatedFilters = { ...currentFilters, ...newFilters }
        set({ 
          filters: updatedFilters, 
          pagination: { ...get().pagination, page: 1 }
        })
        get().fetchVehicles()
      },

      clearFilters: () => {
        set({ 
          filters: {}, 
          searchQuery: '',
          pagination: { ...get().pagination, page: 1 }
        })
        get().fetchVehicles()
      },

      // Pagination
      setPage: (page: number) => {
        set({ pagination: { ...get().pagination, page } })
        get().fetchVehicles()
      },

      setPageSize: (pageSize: number) => {
        set({ pagination: { ...get().pagination, page: 1, pageSize } })
        get().fetchVehicles()
      },

      // Sorting
      setSortBy: (sortBy: SortOption | null) => {
        set({ sortBy })
        get().fetchVehicles()
      },

      // State management
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'vehicle-store'
    }
  )
)

// Selectors for derived state
export const useVehicles = () => useVehicleStore((state) => state.vehicles)
export const useVehicleLoading = () => useVehicleStore((state) => state.loading)
export const useVehicleError = () => useVehicleStore((state) => state.error)
export const useVehicleSearchQuery = () => useVehicleStore((state) => state.searchQuery)
export const useVehicleFilters = () => useVehicleStore((state) => state.filters)
export const useVehiclePagination = () => useVehicleStore((state) => state.pagination)
export const useVehicleTotalCount = () => useVehicleStore((state) => state.totalCount)
export const useVehicleSortBy = () => useVehicleStore((state) => state.sortBy)
export const useManufacturers = () => useVehicleStore((state) => state.manufacturers)
