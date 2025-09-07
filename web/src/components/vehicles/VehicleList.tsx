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
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading vehicles...</span>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'No vehicles match your search criteria'
                  : 'No vehicles found in the database'}
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-2"
                >
                  Clear Search & Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* TanStack Table */}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
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
                    <span className="text-sm text-muted-foreground">
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
