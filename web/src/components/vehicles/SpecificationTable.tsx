import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { VehicleSpecification, Manufacturer } from '@/types/database'

interface SpecificationTableProps {
  specifications?: VehicleSpecification | null
  manufacturer?: Manufacturer | null
  isElectric?: boolean
  loading?: boolean
  error?: string | null
}

interface SpecificationRow {
  label: string
  value: string | number | null | undefined
  unit?: string
  formatter?: (value: any) => string
}

interface SpecificationSection {
  title: string
  icon: string
  rows: SpecificationRow[]
  condition?: boolean
}

const SpecificationTable: React.FC<SpecificationTableProps> = ({
  specifications: specs,
  manufacturer,
  isElectric = false,
  loading = false,
  error = null
}) => {
  // Helper function to format numbers with locale
  const formatNumber = (value: number | null | undefined, decimals = 0): string => {
    if (value === null || value === undefined) return 'N/A'
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }

  // Helper function to format currency
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Helper function to calculate efficiency
  const calculateEfficiency = (): string => {
    if (!specs?.battery_capacity_kwh || !specs?.range_miles) return 'N/A'
    const efficiency = specs.range_miles / specs.battery_capacity_kwh
    return `${Math.round(efficiency * 10) / 10} mi/kWh`
  }

  // Define specification sections
  const sections: SpecificationSection[] = [
    {
      title: 'Battery & Charging',
      icon: '🔋',
      condition: isElectric,
      rows: [
        {
          label: 'Battery Capacity',
          value: specs?.battery_capacity_kwh,
          unit: 'kWh'
        },
        {
          label: 'EPA Range',
          value: specs?.range_miles,
          unit: 'miles'
        },
        {
          label: 'Energy Efficiency',
          value: calculateEfficiency(),
          unit: ''
        }
      ]
    },
    {
      title: 'Performance',
      icon: '⚡',
      rows: [
        {
          label: 'Power',
          value: specs?.power_hp,
          unit: 'hp'
        },
        {
          label: 'Torque',
          value: specs?.torque_lb_ft,
          unit: 'lb-ft'
        },
        {
          label: '0-60 mph',
          value: specs?.acceleration_0_60,
          unit: 'seconds'
        },
        {
          label: 'Top Speed',
          value: specs?.top_speed_mph,
          unit: 'mph'
        },
        {
          label: 'Range',
          value: specs?.range_miles,
          unit: 'miles'
        }
      ]
    },
    {
      title: 'Dimensions',
      icon: '📐',
      rows: [
        {
          label: 'Length',
          value: specs?.length_inches,
          unit: 'inches',
          formatter: (value: number) => `${Math.round(value)} (${Math.round(value / 12 * 10) / 10} ft)`
        },
        {
          label: 'Width',
          value: specs?.width_inches,
          unit: 'inches',
          formatter: (value: number) => `${Math.round(value)} (${Math.round(value / 12 * 10) / 10} ft)`
        },
        {
          label: 'Height',
          value: specs?.height_inches,
          unit: 'inches',
          formatter: (value: number) => `${Math.round(value)} (${Math.round(value / 12 * 10) / 10} ft)`
        },
        {
          label: 'Weight',
          value: specs?.weight_lbs,
          unit: 'lbs',
          formatter: (value: number) => `${formatNumber(value)} (${Math.round(value / 2204.62 * 10) / 10} tonnes)`
        }
      ]
    },
    {
      title: 'Capacity',
      icon: '👥',
      rows: [
        {
          label: 'Seating Capacity',
          value: specs?.seating_capacity,
          unit: 'people'
        },
        {
          label: 'Cargo Capacity',
          value: specs?.cargo_capacity_cu_ft,
          unit: 'cu ft'
        }
      ]
    },
    {
      title: 'Pricing',
      icon: '💰',
      condition: !!specs?.msrp_usd,
      rows: [
        {
          label: 'Starting MSRP',
          value: specs?.msrp_usd,
          formatter: (value: number) => formatCurrency(value)
        }
      ]
    },
    {
      title: 'Manufacturer',
      icon: '🏭',
      condition: !!manufacturer,
      rows: [
        {
          label: 'Company',
          value: manufacturer?.name || 'N/A'
        },
        {
          label: 'Country',
          value: manufacturer?.country || 'N/A'
        }
      ]
    }
  ]

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading specifications...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (!specs && !manufacturer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Detailed specifications are not available for this vehicle.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {sections.map((section) => {
              // Skip sections based on conditions
              if (section.condition === false) return null
              
              // Filter out rows with no data
              const validRows = section.rows.filter(row => {
                if (typeof row.value === 'string') return row.value && row.value !== 'N/A'
                return row.value !== null && row.value !== undefined
              })
              
              // Skip section if no valid rows
              if (validRows.length === 0) return null

              return (
                <div key={section.title} className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span role="img" aria-label={section.title.toLowerCase()}>
                      {section.icon}
                    </span>
                    {section.title}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="space-y-1">
                        {validRows.map((row, index) => {
                          let displayValue: string
                          
                          if (typeof row.value === 'string') {
                            displayValue = row.formatter 
                              ? row.formatter(row.value as any)
                              : row.value
                          } else if (typeof row.value === 'number') {
                            displayValue = row.formatter 
                              ? row.formatter(row.value)
                              : `${formatNumber(row.value)}${row.unit ? ` ${row.unit}` : ''}`
                          } else {
                            displayValue = 'N/A'
                          }

                          return (
                            <tr 
                              key={`${section.title}-${row.label}`}
                              className={`border-b border-border/50 ${
                                index === validRows.length - 1 ? 'border-b-0' : ''
                              }`}
                            >
                              <td className="py-2 pr-4 text-muted-foreground font-medium">
                                {row.label}:
                              </td>
                              <td className="py-2 text-foreground font-medium text-right">
                                {displayValue}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional manufacturer website link if available */}
      {manufacturer?.website && (
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <a 
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
                aria-label={`Visit ${manufacturer.name} website`}
              >
                Visit {manufacturer.name} Official Website →
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SpecificationTable
