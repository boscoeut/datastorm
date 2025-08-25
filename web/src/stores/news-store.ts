import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { NewsArticleService } from '@/services/database'
import type { NewsArticle, SearchFilters, PaginationOptions, SortOption } from '@/types/database'

interface NewsState {
  // Data
  articles: NewsArticle[]
  
  // UI State
  loading: boolean
  error: string | null
  
  // Search and Filtering
  searchQuery: string
  filters: SearchFilters
  
  // Pagination
  pagination: PaginationOptions
  totalCount: number
  
  // Sorting
  sortBy: SortOption | null
}

interface NewsActions {
  // Data fetching
  fetchArticles: () => Promise<void>
  
  // Search and filtering
  setSearchQuery: (query: string) => void
  updateFilters: (filters: Partial<SearchFilters>) => void
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

type NewsStore = NewsState & NewsActions

const initialState: NewsState = {
  articles: [],
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

export const useNewsStore = create<NewsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Data fetching
      fetchArticles: async () => {
        const { pagination, filters } = get()
        
        set({ loading: true, error: null })
        
        try {
          const result = await NewsArticleService.search(filters, pagination)
          
          if (result.error) {
            set({ error: result.error.message, articles: [], totalCount: 0 })
          } else {
            set({ 
              articles: result.data || [], 
              totalCount: result.count || 0,
              error: null 
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch news articles',
            articles: [], 
            totalCount: 0
          })
        } finally {
          set({ loading: false })
        }
      },

      // Search and filtering
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, pagination: { ...get().pagination, page: 1 } })
        // Trigger search when query changes
        get().fetchArticles()
      },

      updateFilters: (newFilters: Partial<SearchFilters>) => {
        const currentFilters = get().filters
        const updatedFilters = { ...currentFilters, ...newFilters }
        set({ 
          filters: updatedFilters, 
          pagination: { ...get().pagination, page: 1 }
        })
        get().fetchArticles()
      },

      clearFilters: () => {
        set({ 
          filters: {}, 
          searchQuery: '',
          pagination: { ...get().pagination, page: 1 }
        })
        get().fetchArticles()
      },

      // Pagination
      setPage: (page: number) => {
        set({ pagination: { ...get().pagination, page } })
        get().fetchArticles()
      },

      setPageSize: (pageSize: number) => {
        set({ pagination: { ...get().pagination, page: 1, pageSize } })
        get().fetchArticles()
      },

      // Sorting
      setSortBy: (sortBy: SortOption | null) => {
        set({ sortBy })
        get().fetchArticles()
      },

      // State management
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'news-store'
    }
  )
)

// Selectors for derived state
export const useNewsArticles = () => useNewsStore((state) => state.articles)
export const useNewsLoading = () => useNewsStore((state) => state.loading)
export const useNewsError = () => useNewsStore((state) => state.error)
export const useNewsSearchQuery = () => useNewsStore((state) => state.searchQuery)
export const useNewsFilters = () => useNewsStore((state) => state.filters)
export const useNewsPagination = () => useNewsStore((state) => state.pagination)
export const useNewsTotalCount = () => useNewsStore((state) => state.totalCount)
export const useNewsSortBy = () => useNewsStore((state) => state.sortBy)

// Simple selectors - no derived state to prevent infinite loops
export const useNewsCategories = () => useNewsStore((state) => state.articles)
export const useNewsTags = () => useNewsStore((state) => state.articles)
