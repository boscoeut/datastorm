import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Swords, X, TrendingUp, TrendingDown, Minus, ExternalLink, Car } from 'lucide-react'
import { useVehicleStore } from '@/stores/vehicle-store'
import { VehicleService } from '@/services/database'
import { supabase } from '@/lib/supabase'
import type { Vehicle } from '@/types/database'

const BattlePage: React.FC = () => {
  const [selectedVehicle1, setSelectedVehicle1] = useState<Vehicle | null>(null)
  const [selectedVehicle2, setSelectedVehicle2] = useState<Vehicle | null>(null)
  const [searchTerm1, setSearchTerm1] = useState('')
  const [searchTerm2, setSearchTerm2] = useState('')
  const [showSearch1, setShowSearch1] = useState(false)
  const [showSearch2, setShowSearch2] = useState(false)

  const { fetchManufacturers, clearError } = useVehicleStore()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize data when component mounts
  useEffect(() => {
    const fetchAllVehicles = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch all vehicles with specifications for battle page
        const { data, error } = await supabase
          .from('vehicles')
          .select(`
            *,
            manufacturers!inner(*),
            vehicle_specifications(*)
          `)
          .eq('is_currently_available', true)
          .order('model', { ascending: true })
        
        if (error) {
          setError(error.message)
          setVehicles([])
        } else {
          // Transform the data to match the expected interface
          const transformedData = (data || []).map(vehicle => {
            if (vehicle.vehicle_specifications && Array.isArray(vehicle.vehicle_specifications)) {
              // Take the first specification if it's an array
              vehicle.specifications = vehicle.vehicle_specifications[0] || null
              delete vehicle.vehicle_specifications
            }
            // Transform manufacturers to manufacturer for consistency
            if (vehicle.manufacturers) {
              vehicle.manufacturer = vehicle.manufacturers
              delete vehicle.manufacturers
            }
            return vehicle
          })
          
          setVehicles(transformedData)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicles')
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllVehicles()
    fetchManufacturers()
  }, [fetchManufacturers])

  // Filter and sort vehicles based on search terms
  const filteredVehicles1 = vehicles
    .filter(vehicle => {
      const searchLower = searchTerm1.toLowerCase()
      return (
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.manufacturer?.name.toLowerCase().includes(searchLower) ||
        (vehicle.trim && vehicle.trim.toLowerCase().includes(searchLower))
      )
    })
    .sort((a, b) => {
      const aName = `${a.manufacturer?.name || ''} ${a.model} ${a.trim || ''}`.trim()
      const bName = `${b.manufacturer?.name || ''} ${b.model} ${b.trim || ''}`.trim()
      return aName.localeCompare(bName)
    })

  const filteredVehicles2 = vehicles
    .filter(vehicle => {
      const searchLower = searchTerm2.toLowerCase()
      return (
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.manufacturer?.name.toLowerCase().includes(searchLower) ||
        (vehicle.trim && vehicle.trim.toLowerCase().includes(searchLower))
      )
    })
    .sort((a, b) => {
      const aName = `${a.manufacturer?.name || ''} ${a.model} ${a.trim || ''}`.trim()
      const bName = `${b.manufacturer?.name || ''} ${b.model} ${b.trim || ''}`.trim()
      return aName.localeCompare(bName)
    })

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
                      <div className="font-medium">{selectedVehicle1.manufacturer?.name} {selectedVehicle1.model}{selectedVehicle1.trim ? ` ${selectedVehicle1.trim}` : ''}</div>
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
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                  {showSearch1 && (
                    <div className="max-h-48 overflow-y-auto border border-input rounded-md bg-background">
                      {filteredVehicles1.length > 0 ? (
                        filteredVehicles1.map(vehicle => (
                          <div
                            key={vehicle.id}
                            onClick={() => handleVehicleSelect(vehicle, 1)}
                            className="p-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                          >
                            <div className="font-medium">{vehicle.manufacturer?.name} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-muted-foreground text-sm">
                          {searchTerm1 ? 'No vehicles found matching your search' : 'No vehicles available'}
                        </div>
                      )}
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
                      <div className="font-medium">{selectedVehicle2.manufacturer?.name} {selectedVehicle2.model}{selectedVehicle2.trim ? ` ${selectedVehicle2.trim}` : ''}</div>
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
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                  {showSearch2 && (
                    <div className="max-h-48 overflow-y-auto border border-input rounded-md bg-background">
                      {filteredVehicles2.length > 0 ? (
                        filteredVehicles2.map(vehicle => (
                          <div
                            key={vehicle.id}
                            onClick={() => handleVehicleSelect(vehicle, 2)}
                            className="p-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                          >
                            <div className="font-medium">{vehicle.manufacturer?.name} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-muted-foreground text-sm">
                          {searchTerm2 ? 'No vehicles found matching your search' : 'No vehicles available'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedVehicle1 && (
        <div className="space-y-6">
          {/* Legend - Only show when both vehicles are selected */}
          {selectedVehicle2 && (
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
          )}

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedVehicle2 ? 'Specification Comparison' : 'Vehicle Specifications'}
              </CardTitle>
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
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-500 bg-gray-100 dark:bg-gray-800">
                            {selectedVehicle1.profile_image_url ? (
                              <img 
                                src={selectedVehicle1.profile_image_url} 
                                alt={`${selectedVehicle1.manufacturer?.name} ${selectedVehicle1.model}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-blue-500 ${selectedVehicle1.profile_image_url ? 'hidden' : ''}`}>
                              <Car className="h-12 w-12" />
                            </div>
                          </div>
                          <Link 
                            to={`/vehicles/${selectedVehicle1.id}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors text-sm"
                          >
                            {selectedVehicle1.manufacturer?.name} {selectedVehicle1.model}{selectedVehicle1.trim ? ` ${selectedVehicle1.trim}` : ''}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </th>
                      {selectedVehicle2 && (
                        <th className="text-center p-3 font-semibold">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-red-500 bg-gray-100 dark:bg-gray-800">
                              {selectedVehicle2.profile_image_url ? (
                                <img 
                                  src={selectedVehicle2.profile_image_url} 
                                  alt={`${selectedVehicle2.manufacturer?.name} ${selectedVehicle2.model}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center text-red-500 ${selectedVehicle2.profile_image_url ? 'hidden' : ''}`}>
                                <Car className="h-12 w-12" />
                              </div>
                            </div>
                            <Link 
                              to={`/vehicles/${selectedVehicle2.id}`}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors text-sm"
                            >
                              {selectedVehicle2.manufacturer?.name} {selectedVehicle2.model}{selectedVehicle2.trim ? ` ${selectedVehicle2.trim}` : ''}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </th>
                      )}
                      {selectedVehicle2 && (
                        <th className="text-center p-3 font-semibold text-muted-foreground">
                          Comparison
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {specifications.map((spec) => {
                      const value1 = selectedVehicle1.specifications?.[spec.key as keyof typeof selectedVehicle1.specifications]
                      const value2 = selectedVehicle2?.specifications?.[spec.key as keyof typeof selectedVehicle2.specifications]
                      
                      return (
                        <tr key={spec.key} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-3 font-medium text-sm">
                            {spec.name}
                          </td>
                          <td className={`p-3 text-center ${selectedVehicle2 ? getTableCellBackground(value1 as number, value2 as number, spec.higherIsBetter) : ''}`}>
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-medium">
                                {formatSpecValue(value1 as number, spec.unit)}
                              </span>
                              {selectedVehicle2 && getComparisonIndicator(value1 as number, value2 as number, spec.higherIsBetter)}
                            </div>
                          </td>
                          {selectedVehicle2 && (
                            <td className={`p-3 text-center ${getTableCellBackground(value2 as number, value1 as number, spec.higherIsBetter)}`}>
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-medium">
                                  {formatSpecValue(value2 as number, spec.unit)}
                                </span>
                                {getComparisonIndicator(value2 as number, value1 as number, spec.higherIsBetter)}
                              </div>
                            </td>
                          )}
                          {selectedVehicle2 && (
                            <td className="p-3 text-center text-sm text-muted-foreground">
                              {value1 && value2 ? (
                                compareValues(value1 as number, value2 as number, spec.higherIsBetter) === 'better' ? 
                                  <Link 
                                    to={`/vehicles/${selectedVehicle1.id}`}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1 transition-colors"
                                  >
                                    {selectedVehicle1.manufacturer?.name} {selectedVehicle1.model}{selectedVehicle1.trim ? ` ${selectedVehicle1.trim}` : ''}
                                    <ExternalLink className="h-3 w-3" />
                                  </Link> :
                                compareValues(value1 as number, value2 as number, spec.higherIsBetter) === 'worse' ? 
                                  <Link 
                                    to={`/vehicles/${selectedVehicle2.id}`}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center justify-center gap-1 transition-colors"
                                  >
                                    {selectedVehicle2.manufacturer?.name} {selectedVehicle2.model}{selectedVehicle2.trim ? ` ${selectedVehicle2.trim}` : ''}
                                    <ExternalLink className="h-3 w-3" />
                                  </Link> :
                                  'Equal'
                              ) : 'N/A'}
                            </td>
                          )}
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
