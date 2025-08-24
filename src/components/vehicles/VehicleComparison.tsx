import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, BarChart3, Plus } from 'lucide-react'
import {
  useComparisonVehicles,
  useMaxComparisonVehicles,
  useComparisonCount,
  useCanAddToComparison,
  useVehicleStore
} from '@/stores/vehicle-store'
import type { VehicleSpecification } from '@/types/database'

interface VehicleComparisonProps {
  onAddVehicle?: () => void
  className?: string
}

const VehicleComparison: React.FC<VehicleComparisonProps> = ({ 
  onAddVehicle,
  className = '' 
}) => {
  const comparisonVehicles = useComparisonVehicles()
  const maxComparisonVehicles = useMaxComparisonVehicles()
  const comparisonCount = useComparisonCount()
  const canAddToComparison = useCanAddToComparison()
  
  const { removeFromComparison, clearComparison } = useVehicleStore()

  // Get all unique specification keys from all vehicles
  const specificationKeys = useMemo(() => {
    const keys = new Set<string>()
    
    comparisonVehicles.forEach(vehicle => {
      if (vehicle.specifications && typeof vehicle.specifications === 'object') {
        Object.keys(vehicle.specifications).forEach(key => {
          if (key !== 'id' && key !== 'vehicle_id' && key !== 'created_at' && key !== 'updated_at') {
            keys.add(key)
          }
        })
      }
    })
    
    return Array.from(keys).sort()
  }, [comparisonVehicles])

  // Format specification values for display
  const formatSpecValue = (value: unknown, key: string): string => {
    if (value === null || value === undefined) return 'N/A'
    
    switch (key) {
      case 'battery_capacity_kwh':
        return `${value} kWh`
      case 'range_miles':
        return `${value} mi`
      case 'power_hp':
        return `${value} hp`
      case 'torque_lb_ft':
        return `${value} lb-ft`
      case 'acceleration_0_60':
        return `${value}s`
      case 'top_speed_mph':
        return `${value} mph`
      case 'weight_lbs':
        return `${value} lbs`
      case 'length_inches':
      case 'width_inches':
      case 'height_inches':
        return `${value}"`
      case 'cargo_capacity_cu_ft':
        return `${value} cu ft`
      case 'seating_capacity':
        return `${value} seats`
      default:
        return String(value)
    }
  }

  // Get the best value for highlighting (for numeric specs)
  const getBestValue = (key: string): number | null => {
    const numericValues = comparisonVehicles
      .map(v => v.specifications?.[key as keyof VehicleSpecification])
      .filter(v => typeof v === 'number' && !isNaN(v as number))
      .map(v => v as number)
    
    if (numericValues.length === 0) return null
    
    // For most specs, higher is better (range, power, etc.)
    // For some specs, lower is better (acceleration, weight)
    const lowerIsBetter = ['acceleration_0_60', 'weight_lbs']
    return lowerIsBetter.includes(key) 
      ? Math.min(...numericValues)
      : Math.max(...numericValues)
  }

  // Check if a value is the best value
  const isBestValue = (value: unknown, key: string): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false
    const bestValue = getBestValue(key)
    if (bestValue === null) return false
    
    const lowerIsBetter = ['acceleration_0_60', 'weight_lbs']
    if (lowerIsBetter.includes(key)) {
      return value === bestValue
    }
    return value === bestValue
  }

  if (comparisonCount === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vehicle Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No vehicles selected for comparison</p>
            <Button onClick={onAddVehicle} disabled={!canAddToComparison}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle to Compare
            </Button>
            <p className="text-sm mt-2">
              Select up to {maxComparisonVehicles} vehicles to compare specifications
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vehicle Comparison ({comparisonCount}/{maxComparisonVehicles})
          </CardTitle>
          <div className="flex items-center gap-2">
            {onAddVehicle && canAddToComparison && (
              <Button variant="outline" size="sm" onClick={onAddVehicle}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearComparison}
              disabled={comparisonCount === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
                         {/* Vehicle Headers */}
             <div className="grid grid-cols-1 gap-4 mb-6">
               {comparisonVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {vehicle.manufacturer?.name || vehicle.manufacturer_id} {vehicle.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.year} {vehicle.trim && `• ${vehicle.trim}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromComparison(vehicle.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Specifications Table */}
            <div className="space-y-4">
              {specificationKeys.map(key => {
                const displayName = key
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
                
                return (
                  <div key={key} className="border rounded-lg p-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      {displayName}
                    </h4>
                                         <div className="grid grid-cols-1 gap-3">
                       {comparisonVehicles.map((vehicle) => {
                        const spec = vehicle.specifications
                        const value = spec && typeof spec === 'object' ? spec[key as keyof VehicleSpecification] : undefined
                        const formattedValue = formatSpecValue(value, key)
                        const isBest = isBestValue(value, key)
                        
                        return (
                          <div key={`${vehicle.id}-${key}`} className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {vehicle.manufacturer?.name || vehicle.manufacturer_id} {vehicle.model}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${isBest ? 'font-semibold text-primary' : ''}`}>
                                {formattedValue}
                              </span>
                              {isBest && (
                                <Badge variant="secondary" className="text-xs">
                                  Best
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VehicleComparison
