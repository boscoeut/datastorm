import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import VehicleSearch from './VehicleSearch'
import {
  useVehicles,
  useVehicleLoading,
  useVehicleError,
  useVehicleSearchQuery,
  useVehicleFilters,
  useVehiclePagination,
  useVehicleTotalCount,
  useVehicleStore
} from '@/stores/vehicle-store'

const VehicleList: React.FC = () => {
  const navigate = useNavigate()
  const vehicles = useVehicles()
  const loading = useVehicleLoading()
  const error = useVehicleError()
  const searchQuery = useVehicleSearchQuery()
  const filters = useVehicleFilters()
  const pagination = useVehiclePagination()
  const totalCount = useVehicleTotalCount()
  
  const {
    fetchVehicles,
    fetchManufacturers,
    setSearchQuery,
    updateFilters,
    clearFilters,
    setPage,
    clearError
  } = useVehicleStore()



  useEffect(() => {
    fetchVehicles()
    fetchManufacturers()
  }, [fetchVehicles, fetchManufacturers])

  const handleVehicleClick = (vehicleId: string) => {
    navigate(`/vehicles/${vehicleId}`)
  }

  const totalPages = Math.ceil(totalCount / pagination.pageSize)

  if (error) {
    return (
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
    )
  }

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
        <div className="text-sm text-muted-foreground">
          {totalCount > 0 && `${totalCount} vehicles found`}
        </div>
      </div>

      {/* Search and Filters */}
      <VehicleSearch
        onSearchChange={setSearchQuery}
        onFilterChange={updateFilters}
        filters={filters}
        searchQuery={searchQuery}
      />

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading vehicles...</span>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'No vehicles match your search criteria'
                  : 'No vehicles found in the database'}
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-2"
                >
                  Clear Search & Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Vehicle Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">Model</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Manufacturer</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Year</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Body Style</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        onClick={() => handleVehicleClick(vehicle.id)}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-medium text-foreground">
                          {vehicle.model}
                          {vehicle.trim && (
                            <span className="text-sm text-muted-foreground ml-2">
                              {vehicle.trim}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {vehicle.manufacturer?.name || vehicle.manufacturer_id}
                        </td>
                        <td className="py-3 px-4 text-foreground">{vehicle.year}</td>
                        <td className="py-3 px-4 text-foreground">
                          {vehicle.body_style || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              vehicle.is_electric
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}
                          >
                            {vehicle.is_electric ? 'Electric' : 'Hybrid/Other'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.page * pagination.pageSize, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setPage(pagination.page + 1)}
                      disabled={pagination.page >= totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default VehicleList
