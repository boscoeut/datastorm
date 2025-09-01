import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Swords, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useVehicleStore, useVehicles, useVehicleLoading, useVehicleError } from '@/stores/vehicle-store'
import type { Vehicle } from '@/types/database'

const BattlePage: React.FC = () => {
  const [selectedVehicle1, setSelectedVehicle1] = useState<Vehicle | null>(null)
  const [selectedVehicle2, setSelectedVehicle2] = useState<Vehicle | null>(null)
  const [searchTerm1, setSearchTerm1] = useState('')
  const [searchTerm2, setSearchTerm2] = useState('')
  const [showSearch1, setShowSearch1] = useState(false)
  const [showSearch2, setShowSearch2] = useState(false)

  const { fetchVehicles, fetchManufacturers, clearError } = useVehicleStore()
  const vehicles = useVehicles()
  const loading = useVehicleLoading()
  const error = useVehicleError()

  // Initialize data when component mounts
  useEffect(() => {
    fetchVehicles()
    fetchManufacturers()
  }, [fetchVehicles, fetchManufacturers])

  // Filter vehicles based on search terms
  const filteredVehicles1 = vehicles.filter(vehicle => 
    vehicle.model.toLowerCase().includes(searchTerm1.toLowerCase()) ||
    vehicle.manufacturer?.name.toLowerCase().includes(searchTerm1.toLowerCase())
  )

  const filteredVehicles2 = vehicles.filter(vehicle => 
    vehicle.model.toLowerCase().includes(searchTerm2.toLowerCase()) ||
    vehicle.manufacturer?.name.toLowerCase().includes(searchTerm2.toLowerCase())
  )

  const handleVehicleSelect = (vehicle: Vehicle, position: 1 | 2) => {
    if (position === 1) {
      setSelectedVehicle1(vehicle)
      setShowSearch1(false)
      setSearchTerm1('')
    } else {
      setSelectedVehicle2(vehicle)
      setShowSearch2(false)
      setSearchTerm2('')
    }
  }

  const handleClearVehicle = (position: 1 | 2) => {
    if (position === 1) {
      setSelectedVehicle1(null)
    } else {
      setSelectedVehicle2(null)
    }
  }

  // Compare two values and return which is better
  const compareValues = (value1: number | null | undefined, value2: number | null | undefined, higherIsBetter: boolean = true) => {
    if (value1 === null || value1 === undefined || value2 === null || value2 === undefined) {
      return 'equal'
    }
    
    if (value1 === value2) return 'equal'
    
    const isBetter = higherIsBetter ? value1 > value2 : value1 < value2
    return isBetter ? 'better' : 'worse'
  }

  // Get comparison indicator for a feature
  const getComparisonIndicator = (value1: number | null | undefined, value2: number | null | undefined, higherIsBetter: boolean = true) => {
    const comparison = compareValues(value1, value2, higherIsBetter)
    
    switch (comparison) {
      case 'better':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'worse':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'equal':
        return <Minus className="h-4 w-4 text-gray-400" />
      default:
        return null
    }
  }

  // Get background color for a table cell based on comparison
  const getTableCellBackground = (value1: number | null | undefined, value2: number | null | undefined, higherIsBetter: boolean = true) => {
    const comparison = compareValues(value1, value2, higherIsBetter)
    
    switch (comparison) {
      case 'better':
        return 'bg-green-50 dark:bg-green-950/20'
      case 'worse':
        return 'bg-red-50 dark:bg-red-950/20'
      case 'equal':
        return 'bg-gray-50 dark:bg-gray-950/20'
      default:
        return ''
    }
  }

  // Format specification values for display
  const formatSpecValue = (value: number | null | undefined, unit: string): string => {
    if (value === null || value === undefined) return 'N/A'
    return `${value} ${unit}`
  }

  // Specification data for comparison
  const specifications = [
    {
      name: 'Range',
      key: 'range_miles',
      unit: 'mi',
      higherIsBetter: true
    },
    {
      name: 'Power',
      key: 'power_hp',
      unit: 'hp',
      higherIsBetter: true
    },
    {
      name: 'Battery Capacity',
      key: 'battery_capacity_kwh',
      unit: 'kWh',
      higherIsBetter: true
    },
    {
      name: '0-60 Acceleration',
      key: 'acceleration_0_60',
      unit: 's',
      higherIsBetter: false
    },
    {
      name: 'Top Speed',
      key: 'top_speed_mph',
      unit: 'mph',
      higherIsBetter: true
    },
    {
      name: 'Torque',
      key: 'torque_lb_ft',
      unit: 'lb-ft',
      higherIsBetter: true
    },
    {
      name: 'Weight',
      key: 'weight_lbs',
      unit: 'lbs',
      higherIsBetter: false
    },
    {
      name: 'Seating Capacity',
      key: 'seating_capacity',
      unit: 'seats',
      higherIsBetter: true
    },
    {
      name: 'Cargo Capacity',
      key: 'cargo_capacity_cu_ft',
      unit: 'cu ft',
      higherIsBetter: true
    }
  ]

  // Handle errors gracefully
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vehicle Battle</h1>
            <p className="text-muted-foreground">Compare two vehicles side by side</p>
          </div>
        </div>

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Swords className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vehicle Battle</h1>
            <p className="text-muted-foreground">Compare two vehicles side by side</p>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading...
          </div>
        )}
      </div>

      {/* Vehicle Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Vehicles to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle 1 Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold">Vehicle 1</h3>
              </div>
              
              {selectedVehicle1 ? (
                <div className="p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedVehicle1.manufacturer?.name} {selectedVehicle1.model}</div>
                      <div className="text-sm text-muted-foreground">{selectedVehicle1.year}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearVehicle(1)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search for vehicle 1..."
                    value={searchTerm1}
                    onChange={(e) => setSearchTerm1(e.target.value)}
                    onFocus={() => setShowSearch1(true)}
                    className="w-full p-2 border border-input rounded-md"
                  />
                  {showSearch1 && (
                    <div className="max-h-48 overflow-y-auto border border-input rounded-md bg-background">
                      {filteredVehicles1.map(vehicle => (
                        <div
                          key={vehicle.id}
                          onClick={() => handleVehicleSelect(vehicle, 1)}
                          className="p-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                        >
                          <div className="font-medium">{vehicle.manufacturer?.name} {vehicle.model}</div>
                          <div className="text-sm text-muted-foreground">{vehicle.year}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Vehicle 2 Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">Vehicle 2</h3>
              </div>
              
              {selectedVehicle2 ? (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedVehicle2.manufacturer?.name} {selectedVehicle2.model}</div>
                      <div className="text-sm text-muted-foreground">{selectedVehicle2.year}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearVehicle(2)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search for vehicle 2..."
                    value={searchTerm2}
                    onChange={(e) => setSearchTerm2(e.target.value)}
                    onFocus={() => setShowSearch2(true)}
                    className="w-full p-2 border border-input rounded-md"
                  />
                  {showSearch2 && (
                    <div className="max-h-48 overflow-y-auto border border-input rounded-md bg-background">
                      {filteredVehicles2.map(vehicle => (
                        <div
                          key={vehicle.id}
                          onClick={() => handleVehicleSelect(vehicle, 2)}
                          className="p-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                        >
                          <div className="font-medium">{vehicle.manufacturer?.name} {vehicle.model}</div>
                          <div className="text-sm text-muted-foreground">{vehicle.year}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedVehicle1 && selectedVehicle2 && (
        <div className="space-y-6">
          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Better</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span>Worse</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-gray-400" />
                  <span>Equal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Specification Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold text-muted-foreground">
                        Specification
                      </th>
                      <th className="text-center p-3 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          {selectedVehicle1.manufacturer?.name} {selectedVehicle1.model}
                        </div>
                      </th>
                      <th className="text-center p-3 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          {selectedVehicle2.manufacturer?.name} {selectedVehicle2.model}
                        </div>
                      </th>
                      <th className="text-center p-3 font-semibold text-muted-foreground">
                        Comparison
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {specifications.map((spec) => {
                      const value1 = selectedVehicle1.specifications?.[spec.key as keyof typeof selectedVehicle1.specifications]
                      const value2 = selectedVehicle2.specifications?.[spec.key as keyof typeof selectedVehicle2.specifications]
                      
                      return (
                        <tr key={spec.key} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-3 font-medium text-sm">
                            {spec.name}
                          </td>
                          <td className={`p-3 text-center ${getTableCellBackground(value1 as number, value2 as number, spec.higherIsBetter)}`}>
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-medium">
                                {formatSpecValue(value1 as number, spec.unit)}
                              </span>
                              {getComparisonIndicator(value1 as number, value2 as number, spec.higherIsBetter)}
                            </div>
                          </td>
                          <td className={`p-3 text-center ${getTableCellBackground(value2 as number, value1 as number, spec.higherIsBetter)}`}>
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-medium">
                                {formatSpecValue(value2 as number, spec.unit)}
                              </span>
                              {getComparisonIndicator(value2 as number, value1 as number, spec.higherIsBetter)}
                            </div>
                          </td>
                          <td className="p-3 text-center text-sm text-muted-foreground">
                            {value1 && value2 ? (
                              compareValues(value1 as number, value2 as number, spec.higherIsBetter) === 'better' ? 
                                `${selectedVehicle1.manufacturer?.name} ${selectedVehicle1.model}` :
                              compareValues(value1 as number, value2 as number, spec.higherIsBetter) === 'worse' ? 
                                `${selectedVehicle2.manufacturer?.name} ${selectedVehicle2.model}` :
                                'Equal'
                            ) : 'N/A'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default BattlePage
