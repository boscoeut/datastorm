import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import VehicleSearch from './VehicleSearch'
import ComparisonButton from './ComparisonButton'
import {
  useVehicles,
  useVehicleLoading,
  useVehicleError,
  useVehicleSearchQuery,
  useVehicleFilters,
  useVehiclePagination,
  useVehicleTotalCount,
  useVehicleStore
} from '@/stores/vehicle-store'
import type { Vehicle } from '@/types/database'

interface VehicleListProps {
  showHeader?: boolean
}

const VehicleList: React.FC<VehicleListProps> = ({ showHeader = true }) => {
  const navigate = useNavigate()
  const vehicles = useVehicles()
  const loading = useVehicleLoading()
  const error = useVehicleError()
  const searchQuery = useVehicleSearchQuery()
  const filters = useVehicleFilters()
  const pagination = useVehiclePagination()
  const totalCount = useVehicleTotalCount()
  
  const [sorting, setSorting] = useState<SortingState>([])
  
  const {
    fetchVehicles,
    fetchManufacturers,
    setSearchQuery,
    updateFilters,
    clearFilters,
    setPage,
    clearError
  } = useVehicleStore()

  useEffect(() => {
    fetchVehicles()
    fetchManufacturers()
  }, [fetchVehicles, fetchManufacturers])


  const handleVehicleClick = (vehicleId: string) => {
    navigate(`/vehicles/${vehicleId}`)
  }

  // Define table columns with TanStack table
  const columns = useMemo<ColumnDef<Vehicle>[]>(() => [
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {vehicle.profile_image_url ? (
              <img
                src={vehicle.profile_image_url}
                alt={`${vehicle.manufacturer?.name || 'Unknown'} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'model',
      header: 'Model',
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div className="font-medium text-foreground">
            {vehicle.model}
            {vehicle.trim && (
              <span className="text-sm text-muted-foreground ml-2">
                {vehicle.trim}
              </span>
            )}
          </div>
        )
      },
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'manufacturer',
      header: 'Manufacturer',
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <span className="text-foreground">
            {vehicle.manufacturer?.name || vehicle.manufacturer_id}
          </span>
        )
      },
      sortingFn: (rowA, rowB) => {
        const nameA = rowA.original.manufacturer?.name || rowA.original.manufacturer_id
        const nameB = rowB.original.manufacturer?.name || rowB.original.manufacturer_id
        return nameA.localeCompare(nameB)
      },
    },
    {
      accessorKey: 'body_style',
      header: 'Body Style',
      cell: ({ row }) => (
        <span className="text-foreground">
          {row.original.body_style || 'N/A'}
        </span>
      ),
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'is_electric',
      header: 'Type',
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              vehicle.is_electric
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}
          >
            {vehicle.is_electric ? 'Electric' : 'Hybrid/Other'}
          </span>
        )
      },
      sortingFn: (rowA, rowB) => {
        return (rowA.original.is_electric === rowB.original.is_electric) ? 0 : rowA.original.is_electric ? 1 : -1
      },
    },
    {
      accessorKey: 'specifications.msrp_usd',
      header: 'Starting MSRP',
      cell: ({ row }) => {
        const vehicle = row.original
        const msrp = vehicle.specifications?.msrp_usd
        
        if (!msrp) {
          return (
            <span className="text-muted-foreground text-sm">
              N/A
            </span>
          )
        }
        
        return (
          <span className="font-medium text-foreground">
            ${msrp.toLocaleString()}
          </span>
        )
      },
      sortingFn: (rowA, rowB) => {
        const msrpA = rowA.original.specifications?.msrp_usd || 0
        const msrpB = rowB.original.specifications?.msrp_usd || 0
        return msrpA - msrpB
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const vehicle = row.original
        
        return (
          <div className="flex items-center gap-2">
            <ComparisonButton vehicle={vehicle} />
          </div>
        )
      },
    },
  ], [])

  // Initialize TanStack table
  const table = useReactTable({
    data: vehicles,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const totalPages = Math.ceil(totalCount / pagination.pageSize)

  if (error) {
    return (
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
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <VehicleSearch
        onSearchChange={setSearchQuery}
        onFilterChange={updateFilters}
        filters={filters}
        searchQuery={searchQuery}
        disableSearchSync={true}
      />

      {/* Results */}
      <Card>       
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8 px-4 sm:px-0">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm sm:text-base text-muted-foreground">Loading vehicles...</span>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 px-4 sm:px-0">
              <p className="text-sm sm:text-base text-muted-foreground">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'No vehicles match your search criteria'
                  : 'No vehicles found in the database'}
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-2"
                  size="sm"
                >
                  Clear Search & Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                <div className="space-y-3 p-4">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleVehicleClick(vehicle.id)}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          {vehicle.profile_image_url ? (
                            <img
                              src={vehicle.profile_image_url}
                              alt={`${vehicle.manufacturer?.name || 'Unknown'} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl">🚗</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-foreground truncate">
                                {vehicle.model}
                                {vehicle.trim && (
                                  <span className="text-sm text-muted-foreground ml-1">
                                    {vehicle.trim}
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {vehicle.manufacturer?.name || vehicle.manufacturer_id}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    vehicle.is_electric
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}
                                >
                                  {vehicle.is_electric ? 'Electric' : 'Hybrid/Other'}
                                </span>
                                {vehicle.specifications?.msrp_usd && (
                                  <span className="text-xs font-medium text-foreground">
                                    ${vehicle.specifications.msrp_usd.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <ComparisonButton vehicle={vehicle} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b border-border">
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="text-left py-3 px-4 font-medium text-foreground cursor-pointer select-none hover:bg-muted/50 transition-colors"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className="flex items-center gap-2">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: <ChevronUp className="h-4 w-4" />,
                                  desc: <ChevronDown className="h-4 w-4" />,
                                }[header.column.getIsSorted() as string] ?? (
                                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => handleVehicleClick(row.original.id)}
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="py-3 px-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 sm:p-0">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.page * pagination.pageSize, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground px-2">
                      Page {pagination.page} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setPage(pagination.page + 1)}
                      disabled={pagination.page >= totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default VehicleList
