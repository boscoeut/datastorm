import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import VehicleList from '@/components/vehicles/VehicleList'
import VehicleComparison from '@/components/vehicles/VehicleComparison'
import FloatingComparisonButton from '@/components/vehicles/FloatingComparisonButton'
import {
  useVehicleStore,
  useVehicleLoading,
  useVehicleError,
  useVehicleTotalCount
} from '@/stores/vehicle-store'

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate()
  const [isComparisonVisible, setIsComparisonVisible] = useState(true)

  const { fetchVehicles, fetchManufacturers, clearError } = useVehicleStore()
  const loading = useVehicleLoading()
  const error = useVehicleError()
  const totalCount = useVehicleTotalCount()

  // Initialize data when component mounts
  useEffect(() => {
    fetchVehicles()
    fetchManufacturers()
  }, [fetchVehicles, fetchManufacturers])

  const toggleComparison = () => {
    setIsComparisonVisible(!isComparisonVisible)
  }

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

      {/* Vehicle List with integrated search and filters */}
      <VehicleList showHeader={false} />

      {/* Vehicle Comparison - Conditionally visible */}
      {isComparisonVisible && <VehicleComparison />}

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

      {/* Floating Comparison Button */}
      <FloatingComparisonButton
        onToggleComparison={toggleComparison}
        isComparisonVisible={isComparisonVisible}
      />
    </div>
  )
}

export default VehiclesPage
