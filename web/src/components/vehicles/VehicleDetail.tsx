import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SpecificationTable from './SpecificationTable'
import VehicleImageGallery from './VehicleImageGallery'
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

  const handleProfileImageUpdate = (imageUrl: string) => {
    if (vehicle) {
      setVehicle({
        ...vehicle,
        profile_image_url: imageUrl
      })
    }
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

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleBackToList} variant="outline">
          ← Back to Vehicles
        </Button>
      </div>

      {/* Vehicle Header with Profile Image */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Image */}
            <div className="lg:col-span-1">
              {vehicle.profile_image_url ? (
                <div className="relative group">
                  <img
                    src={vehicle.profile_image_url}
                    alt={`${manufacturer?.name || 'Unknown'} ${vehicle.model}`}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 hover:bg-gray-100"
                    >
                      View Full Size
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🚗</span>
                    </div>
                    <p>No profile image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold text-foreground">
                  {manufacturer?.name || 'Unknown'} {vehicle.model}
                </h1>
                {vehicle.trim && (
                  <p className="text-xl text-muted-foreground mt-2">{vehicle.trim}</p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  {vehicle.body_style || 'N/A'}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    vehicle.is_electric
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}
                >
                  {vehicle.is_electric ? '⚡ Electric' : '🔋 Hybrid/Other'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Current Model
                </span>
              </div>

              {/* Quick Specs Preview */}
              {specs && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {specs.range_miles && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{specs.range_miles}</div>
                      <div className="text-xs text-muted-foreground">Miles Range</div>
                    </div>
                  )}
                  {specs.power_hp && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{specs.power_hp}</div>
                      <div className="text-xs text-muted-foreground">Horsepower</div>
                    </div>
                  )}
                  {specs.acceleration_0_60 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{specs.acceleration_0_60}s</div>
                      <div className="text-xs text-muted-foreground">0-60 mph</div>
                    </div>
                  )}
                  {specs.battery_capacity_kwh && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{specs.battery_capacity_kwh}</div>
                      <div className="text-xs text-muted-foreground">kWh Battery</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Images Gallery */}
      <VehicleImageGallery
        vehicleId={vehicle.id}
        profileImageUrl={vehicle.profile_image_url}
        onProfileImageUpdate={handleProfileImageUpdate}
      />

      {/* Vehicle Specifications */}
      <SpecificationTable 
        specifications={specs}
        manufacturer={manufacturer}
        isElectric={vehicle.is_electric}
        loading={false}
        error={null}
      />
    </div>
  )
}

export default VehicleDetail
