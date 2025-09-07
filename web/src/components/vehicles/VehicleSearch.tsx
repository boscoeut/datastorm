import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Search, Filter, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useVehicleStore, useManufacturers } from '@/stores/vehicle-store'
import type { VehicleFilters } from '@/types/database'

interface VehicleSearchProps {
  onSearchChange?: (query: string | undefined) => void
  onFilterChange?: (filters: VehicleFilters) => void
  filters?: VehicleFilters
  searchQuery?: string | undefined
  disableSearchSync?: boolean // New prop to disable search synchronization
}

const VehicleSearch: React.FC<VehicleSearchProps> = ({
  onSearchChange,
  onFilterChange,
  filters = {},
  searchQuery = undefined,
  disableSearchSync = false
}) => {
  const manufacturers = useManufacturers()
  const { fetchManufacturers } = useVehicleStore()
  
  // Local state for search and filters
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '')
  const [localFilters, setLocalFilters] = useState<VehicleFilters>(filters)
  
  
  // Debounced search query for performance
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300)
  
  // Filter state for UI
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Fetch manufacturers on component mount
  useEffect(() => {
    fetchManufacturers()
  }, [fetchManufacturers])
  
  // Update local state when props change
  useEffect(() => {
    setLocalSearchQuery(searchQuery || '')
  }, [searchQuery])
  
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])
  
  // Handle search query changes with debouncing - only call onSearchChange if not disabled and conditions are met
  useEffect(() => {
    if (!disableSearchSync && onSearchChange && debouncedSearchQuery !== (searchQuery || '')) {
      // If debounced query is empty, pass undefined to clear the search
      onSearchChange(debouncedSearchQuery === '' ? undefined : debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, onSearchChange, searchQuery, disableSearchSync])
  
  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof VehicleFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }, [localFilters, onFilterChange])
  
  // Clear all filters and search
  const handleClearAll = useCallback(() => {
    setLocalSearchQuery('')
    setLocalFilters({})
    
    if (onSearchChange) onSearchChange(undefined)
    if (onFilterChange) onFilterChange({})
  }, [onSearchChange, onFilterChange])
  
  // Check if any filters are active
  const hasActiveFilters = Object.keys(localFilters).length > 0 || localSearchQuery.length > 0
  
  // Get active filter count for display
  const activeFilterCount = Object.keys(localFilters).filter(key => 
    localFilters[key as keyof VehicleFilters] !== undefined && 
    localFilters[key as keyof VehicleFilters] !== ''
  ).length + (localSearchQuery.length > 0 ? 1 : 0)
  
  return (
    <Card className="transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Search & Filters</CardTitle>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {activeFilterCount} active
                  </Badge>
                  <Button
                    onClick={handleClearAll}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Compact Search Bar */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Search Vehicles
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                type="text"
                placeholder="Search by model or manufacturer..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="flex-1"
                aria-describedby="search-help"
              />
              <Button
                onClick={() => onSearchChange?.(localSearchQuery)}
                disabled={localSearchQuery === searchQuery}
                size="sm"
              >
                Search
              </Button>
            </div>
            <p id="search-help" className="text-xs text-muted-foreground">
              Search across vehicle models and manufacturers
            </p>
          </div>
          
          {/* Basic Filters - Horizontal Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Manufacturer Filter */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-sm font-medium">
                Manufacturer
              </Label>
              <select
                id="manufacturer"
                value={localFilters.manufacturer_id || ''}
                onChange={(e) => handleFilterChange('manufacturer_id', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map((manufacturer: { id: string; name: string }) => (
                  <option key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Body Style Filter */}
            <div className="space-y-2">
              <Label htmlFor="body-style" className="text-sm font-medium">
                Body Style
              </Label>
              <select
                id="body-style"
                value={localFilters.body_style || ''}
                onChange={(e) => handleFilterChange('body_style', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
              >
                <option value="">All Body Styles</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Pickup Truck">Pickup Truck</option>
                <option value="Crossover">Crossover</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
              </select>
            </div>
          </div>
          
          {/* Advanced Filters Toggle */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="ghost"
              size="sm"
              className="text-xs flex items-center gap-2"
            >
              <Filter className="h-3 w-3" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </Button>
          </div>
          
          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
              {/* Electric Vehicle Filter */}
              <div className="space-y-2">
                <Label htmlFor="is-electric" className="text-sm font-medium">
                  Vehicle Type
                </Label>
                <select
                  id="is-electric"
                  value={localFilters.is_electric !== undefined ? localFilters.is_electric.toString() : ''}
                  onChange={(e) => handleFilterChange('is_electric', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                >
                  <option value="">All Types</option>
                  <option value="true">Electric Only</option>
                  <option value="false">Hybrid/Other</option>
                </select>
              </div>
              
              {/* Range Filters */}
              <div className="space-y-2">
                <Label htmlFor="range-min" className="text-sm font-medium">
                  Range Min (miles)
                </Label>
                <Input
                  id="range-min"
                  type="number"
                  placeholder="200"
                  value={localFilters.range_min || ''}
                  onChange={(e) => handleFilterChange('range_min', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  max="1000"
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="range-max" className="text-sm font-medium">
                  Range Max (miles)
                </Label>
                <Input
                  id="range-max"
                  type="number"
                  placeholder="400"
                  value={localFilters.range_max || ''}
                  onChange={(e) => handleFilterChange('range_max', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  max="1000"
                  className="text-sm"
                />
              </div>
              
              {/* Price Filters */}
              <div className="space-y-2">
                <Label htmlFor="price-min" className="text-sm font-medium">
                  Price Min ($)
                </Label>
                <Input
                  id="price-min"
                  type="number"
                  placeholder="30000"
                  value={localFilters.price_min || ''}
                  onChange={(e) => handleFilterChange('price_min', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  step="1000"
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price-max" className="text-sm font-medium">
                  Price Max ($)
                </Label>
                <Input
                  id="price-max"
                  type="number"
                  placeholder="80000"
                  value={localFilters.price_max || ''}
                  onChange={(e) => handleFilterChange('price_max', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  step="1000"
                  className="text-sm"
                />
              </div>
            </div>
          )}
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {localSearchQuery && (
                  <Badge variant="outline" className="text-xs">
                    Search: "{localSearchQuery}"
                  </Badge>
                )}
                {Object.entries(localFilters).map(([key, value]) => {
                  if (value === undefined || value === '') return null
                  
                  let displayValue = value
                  if (key === 'is_electric') {
                    displayValue = value ? 'Electric Only' : 'Hybrid/Other'
                  } else if (key === 'manufacturer_id') {
                    const manufacturer = manufacturers.find((m: { id: string; name: string }) => m.id === value)
                    displayValue = manufacturer?.name || value
                  }
                  
                  return (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key.replace(/_/g, ' ')}: {displayValue}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default VehicleSearch
