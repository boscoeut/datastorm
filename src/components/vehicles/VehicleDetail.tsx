import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VehicleService } from '@/services/database'
import type { VehicleWithDetails } from '@/types/database'

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [vehicle, setVehicle] = useState<VehicleWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) {
        setError('Vehicle ID is required')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await VehicleService.getWithDetails(id)
        
        if (result.error) {
          setError(result.error.message)
          setVehicle(null)
        } else {
          setVehicle(result.data)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle details')
        setVehicle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleDetails()
  }, [id])

  const handleBackToList = () => {
    navigate('/vehicles')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToList} variant="outline">
            ← Back to Vehicles
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading vehicle details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToList} variant="outline">
            ← Back to Vehicles
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error || 'Vehicle not found'}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const specs = vehicle.specifications
  const manufacturer = vehicle.manufacturer
  const marketData = vehicle.market_data?.[0] // Get most recent market data

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleBackToList} variant="outline">
          ← Back to Vehicles
        </Button>
      </div>

      {/* Vehicle Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          {manufacturer?.name || 'Unknown'} {vehicle.model}
        </h1>
        {vehicle.trim && (
          <p className="text-xl text-muted-foreground">{vehicle.trim}</p>
        )}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground" role="group" aria-label="Vehicle basic information">
          <span>{vehicle.year}</span>
          <span aria-hidden="true">•</span>
          <span>{vehicle.body_style || 'N/A'}</span>
          <span aria-hidden="true">•</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              vehicle.is_electric
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}
            role="status"
            aria-label={`Vehicle type: ${vehicle.is_electric ? 'Electric' : 'Hybrid or other fuel type'}`}
          >
            {vehicle.is_electric ? 'Electric' : 'Hybrid/Other'}
          </span>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="region" aria-label="Vehicle specifications">
        
        {/* Performance Metrics */}
        {specs && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.range_miles && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Range:</span>
                  <span className="font-medium">{specs.range_miles} miles</span>
                </div>
              )}
              {specs.power_hp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power:</span>
                  <span className="font-medium">{specs.power_hp} hp</span>
                </div>
              )}
              {specs.torque_lb_ft && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Torque:</span>
                  <span className="font-medium">{specs.torque_lb_ft} lb-ft</span>
                </div>
              )}
              {specs.acceleration_0_60 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">0-60 mph:</span>
                  <span className="font-medium">{specs.acceleration_0_60}s</span>
                </div>
              )}
              {specs.top_speed_mph && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top Speed:</span>
                  <span className="font-medium">{specs.top_speed_mph} mph</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Battery Specifications */}
        {specs && vehicle.is_electric && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔋 Battery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.battery_capacity_kwh && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{specs.battery_capacity_kwh} kWh</span>
                </div>
              )}
              {specs.range_miles && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EPA Range:</span>
                  <span className="font-medium">{specs.range_miles} miles</span>
                </div>
              )}
              {specs.battery_capacity_kwh && specs.range_miles && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Efficiency:</span>
                  <span className="font-medium">
                    {Math.round((specs.range_miles / specs.battery_capacity_kwh) * 10) / 10} mi/kWh
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dimensions */}
        {specs && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📐 Dimensions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.length_inches && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Length:</span>
                  <span className="font-medium">{specs.length_inches}"</span>
                </div>
              )}
              {specs.width_inches && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Width:</span>
                  <span className="font-medium">{specs.width_inches}"</span>
                </div>
              )}
              {specs.height_inches && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height:</span>
                  <span className="font-medium">{specs.height_inches}"</span>
                </div>
              )}
              {specs.weight_lbs && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{specs.weight_lbs.toLocaleString()} lbs</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Capacity */}
        {specs && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.seating_capacity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seating:</span>
                  <span className="font-medium">{specs.seating_capacity} people</span>
                </div>
              )}
              {specs.cargo_capacity_cu_ft && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cargo:</span>
                  <span className="font-medium">{specs.cargo_capacity_cu_ft} cu ft</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Market Data */}
        {marketData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 Market Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketData.msrp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MSRP:</span>
                  <span className="font-medium">${marketData.msrp.toLocaleString()}</span>
                </div>
              )}
              {marketData.current_price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price:</span>
                  <span className="font-medium">${marketData.current_price.toLocaleString()}</span>
                </div>
              )}
              {marketData.inventory_count && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inventory:</span>
                  <span className="font-medium">{marketData.inventory_count} units</span>
                </div>
              )}
              {marketData.market_trend && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trend:</span>
                  <span className="font-medium capitalize">{marketData.market_trend}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manufacturer Info */}
        {manufacturer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏭 Manufacturer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium">{manufacturer.name}</span>
              </div>
              {manufacturer.country && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium">{manufacturer.country}</span>
                </div>
              )}
              {manufacturer.website && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Website:</span>
                  <a 
                    href={manufacturer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Visit Site
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* No Data Message */}
      {!specs && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Detailed specifications are not available for this vehicle.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default VehicleDetail
