import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SpecificationTable from './SpecificationTable'
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

      {/* Vehicle Specifications */}
      <SpecificationTable 
        specifications={specs}
        marketData={marketData}
        manufacturer={manufacturer}
        isElectric={vehicle.is_electric}
        loading={false}
        error={null}
      />
    </div>
  )
}

export default VehicleDetail
