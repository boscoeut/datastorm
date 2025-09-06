import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import VehicleList from '@/components/vehicles/VehicleList'
import VehicleComparisonModal from '@/components/vehicles/VehicleComparisonModal'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useVehicleStore,
  useVehicleLoading,
  useVehicleError,
  useVehicleTotalCount,
  useComparisonCount,
  useVehicleSearchQuery
} from '@/stores/vehicle-store'

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate()

  const { fetchVehicles, fetchManufacturers, clearError, setSearchQuery } = useVehicleStore()
  const loading = useVehicleLoading()
  const error = useVehicleError()
  const totalCount = useVehicleTotalCount()
  const comparisonCount = useComparisonCount()
  const searchQuery = useVehicleSearchQuery()

  // Local state for quick search with debouncing
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300)

  // Initialize data when component mounts
  useEffect(() => {
    fetchVehicles()
    fetchManufacturers()
  }, [fetchVehicles, fetchManufacturers])

  // Update local search query when store search query changes (from advanced search)
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  // Update store search query when debounced local query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setSearchQuery(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, searchQuery, setSearchQuery])

  // Handle errors gracefully
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vehicle Database</h1>
            <p className="text-muted-foreground">
              Browse and search electric vehicles in our comprehensive database
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Quick search vehicles..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search vehicles by model or manufacturer"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Searching for: "{searchQuery}"
            </p>
          )}
        </div>

        {/* Error Display */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={clearError} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Database</h1>
          <p className="text-muted-foreground">
            Browse and search electric vehicles in our comprehensive database
          </p>
        </div>
        <div className="flex items-center gap-4">
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {totalCount} vehicles in database
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Quick Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Quick search vehicles..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search vehicles by model or manufacturer"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Searching for: "{searchQuery}"
          </p>
        )}
      </div>

      {/* Vehicle List with integrated search and filters */}
      <VehicleList showHeader={false} />

      {/* Fixed Floating Compare Button - Always visible when vehicles are selected */}
      {comparisonCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <VehicleComparisonModal />
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
          >
            ← Back to Home
          </Button>

          <Button
            onClick={() => navigate('/news')}
            variant="outline"
            size="sm"
          >
            Industry News →
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default VehiclesPage
