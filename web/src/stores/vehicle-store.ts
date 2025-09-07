import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { VehicleService, ManufacturerService } from '@/services/database'
import type { Vehicle, VehicleFilters, PaginationOptions, SortOption } from '@/types/database'

interface VehicleState {
  // Data
  vehicles: Vehicle[]
  manufacturers: { id: string; name: string }[]
  
  // UI State
  loading: boolean
  error: string | null
  
  // Search and Filtering
  searchQuery: string | undefined
  filters: VehicleFilters
  
  // Pagination
  pagination: PaginationOptions
  totalCount: number
  
  // Sorting
  sortBy: SortOption | null
  
  // Comparison
  comparisonVehicles: Vehicle[]
  maxComparisonVehicles: number
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
  
  // Comparison
  addToComparison: (vehicle: Vehicle) => void
  removeFromComparison: (vehicleId: string) => void
  clearComparison: () => void
  setMaxComparisonVehicles: (max: number) => void
  
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
  searchQuery: undefined,
  filters: {
    is_currently_available: true
  },
  pagination: {
    page: 1,
    pageSize: 20
  },
  totalCount: 0,
  sortBy: null,
  comparisonVehicles: [],
  maxComparisonVehicles: 4
}

export const useVehicleStore = create<VehicleStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Data fetching
            fetchVehicles: async () => {
        const { pagination, filters, sortBy, searchQuery } = get()
        
        set({ loading: true, error: null })
        
        try {
          // Use the search method to get current vehicles with search functionality
          const result = await VehicleService.search(filters, pagination, sortBy || undefined, searchQuery)
          
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
          const result = await ManufacturerService.list({
            pagination: { page: 1, pageSize: 100 } // Get all manufacturers
          })
          
          if (result.error) {
            set({ error: result.error.message })
          } else {
            set({ manufacturers: result.data || [], error: null })
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
      setSearchQuery: (query: string | undefined) => {
        set({ searchQuery: query, pagination: { ...get().pagination, page: 1 } })
        // Trigger a new search when search query changes
        get().fetchVehicles()
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
          filters: { is_currently_available: true }, 
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

      // Comparison
      addToComparison: async (vehicle: Vehicle) => {
        const { comparisonVehicles, maxComparisonVehicles } = get()
        
        // Check if vehicle is already in comparison
        if (comparisonVehicles.some(v => v.id === vehicle.id)) {
          return
        }
        
        // Check if we've reached the maximum
        if (comparisonVehicles.length >= maxComparisonVehicles) {
          return
        }
        
        try {
          // Fetch full vehicle details with specifications
          const result = await VehicleService.getWithDetails(vehicle.id)
          if (result.error) {
            console.error('Failed to fetch vehicle details:', result.error)
            // Still add the vehicle but without specs
            set({ comparisonVehicles: [...comparisonVehicles, vehicle] })
          } else if (result.data) {
            // Add vehicle with full details
            set({ comparisonVehicles: [...comparisonVehicles, result.data] })
          } else {
            // Fallback to adding vehicle without specs
            set({ comparisonVehicles: [...comparisonVehicles, vehicle] })
          }
        } catch (error) {
          console.error('Error fetching vehicle details:', error)
          // Fallback to adding vehicle without specs
          set({ comparisonVehicles: [...comparisonVehicles, vehicle] })
        }
      },

      removeFromComparison: (vehicleId: string) => {
        const { comparisonVehicles } = get()
        set({ 
          comparisonVehicles: comparisonVehicles.filter(v => v.id !== vehicleId) 
        })
      },

      clearComparison: () => {
        set({ comparisonVehicles: [] })
      },

      setMaxComparisonVehicles: (max: number) => {
        set({ maxComparisonVehicles: max })
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

// Comparison selectors
export const useComparisonVehicles = () => useVehicleStore((state) => state.comparisonVehicles)
export const useMaxComparisonVehicles = () => useVehicleStore((state) => state.maxComparisonVehicles)
export const useComparisonCount = () => useVehicleStore((state) => state.comparisonVehicles.length)
export const useCanAddToComparison = () => useVehicleStore((state) => 
  state.comparisonVehicles.length < state.maxComparisonVehicles
)
