import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, BarChart3, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  useComparisonVehicles,
  useMaxComparisonVehicles,
  useComparisonCount,
  useCanAddToComparison,
  useVehicleStore
} from '@/stores/vehicle-store'
import type { VehicleSpecification } from '@/types/database'

interface VehicleComparisonModalProps {
  onAddVehicle?: () => void
  trigger?: React.ReactNode
}

const VehicleComparisonModal: React.FC<VehicleComparisonModalProps> = ({ 
  onAddVehicle,
  trigger
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

  const defaultTrigger = (
    <Button
      variant="default"
      size="lg"
      className="relative shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6"
    >
      <BarChart3 className="h-5 w-5 mr-2" />
      Compare ({comparisonCount}/{maxComparisonVehicles})
      {comparisonCount > 0 && (
        <Badge 
          variant="secondary" 
          className="ml-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {comparisonCount}
        </Badge>
      )}
    </Button>
  )

  if (comparisonCount === 0) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Vehicle Comparison
            </DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Vehicle Comparison ({comparisonCount}/{maxComparisonVehicles})
          </DialogTitle>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {comparisonVehicles.slice(0, 3).map((vehicle) => (
                <Badge key={vehicle.id} variant="outline" className="text-xs">
                  {vehicle.manufacturer?.name || vehicle.manufacturer_id} {vehicle.model}
                </Badge>
              ))}
              {comparisonVehicles.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{comparisonVehicles.length - 3} more
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {onAddVehicle && canAddToComparison && (
                <Button variant="outline" size="sm" onClick={onAddVehicle}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
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
        </DialogHeader>
        
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
                      {vehicle.trim && `${vehicle.trim}`} • Current Model
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

            {/* Specifications Grid */}
            <div className="border rounded-lg overflow-hidden">
              {/* Grid Header Row */}
              <div className={`grid gap-0 ${comparisonCount === 1 ? 'grid-cols-2' : comparisonCount === 2 ? 'grid-cols-3' : comparisonCount === 3 ? 'grid-cols-4' : 'grid-cols-5'}`}>
                <div className="p-4 bg-muted font-medium text-sm border-r">
                  Feature
                </div>
                {comparisonVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 bg-muted font-medium text-sm border-r last:border-r-0">
                    {vehicle.manufacturer?.name || vehicle.manufacturer_id} {vehicle.model}
                  </div>
                ))}
              </div>
              
              {/* Grid Data Rows */}
              {specificationKeys.map(key => {
                const displayName = key
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
                
                return (
                  <div key={key} className={`grid gap-0 ${comparisonCount === 1 ? 'grid-cols-2' : comparisonCount === 2 ? 'grid-cols-3' : comparisonCount === 3 ? 'grid-cols-4' : 'grid-cols-5'}`}>
                    <div className="p-4 font-medium text-sm border-r border-t bg-card">
                      {displayName}
                    </div>
                    {comparisonVehicles.map((vehicle) => {
                      const spec = vehicle.specifications
                      const value = spec && typeof spec === 'object' ? spec[key as keyof VehicleSpecification] : undefined
                      const formattedValue = formatSpecValue(value, key)
                      const isBest = isBestValue(value, key)
                      
                      return (
                        <div key={`${vehicle.id}-${key}`} className="p-4 border-r border-t last:border-r-0 bg-card">
                          <div className="flex items-center justify-center gap-2">
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
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VehicleComparisonModal
