import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Loader2, CheckCircle, XCircle, Database, Newspaper, Car, ExternalLink } from 'lucide-react'
import { VehicleDetailsUpdateService, type VehicleDetailsUpdateOptions, type VehicleDetailsUpdateResult } from '@/services/vehicle-details-update'
import { useAuth } from '@/contexts/AuthContext'

interface UpdateVehicleDetailsButtonProps {
  manufacturer: string
  model: string
  trim?: string
  year?: number
  onDetailsUpdated?: () => void
  className?: string
}

export const UpdateVehicleDetailsButton: React.FC<UpdateVehicleDetailsButtonProps> = ({
  manufacturer,
  model,
  trim,
  year,
  onDetailsUpdated,
  className
}) => {
  const { isAdmin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VehicleDetailsUpdateResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Don't render if user is not admin
  if (!isAdmin) {
    return null
  }

  const handleUpdateVehicleDetails = async () => {
    setIsLoading(true)
    setResult(null)
    setShowResult(false)

    console.log('UpdateVehicleDetailsButton props:', {
      manufacturer,
      model,
      trim,
      year
    })

    try {
      const options: VehicleDetailsUpdateOptions = {
        manufacturer,
        model,
        trim,
        year
      }

      console.log('VehicleDetailsUpdateOptions:', options)

      const updateResult = await VehicleDetailsUpdateService.updateVehicleDetails(options)
      setResult(updateResult)
      setShowResult(true)

      // Call the callback if update was successful
      if (updateResult.success) {
        onDetailsUpdated?.()
      }
    } catch (error) {
      const errorResult: VehicleDetailsUpdateResult = {
        success: false,
        message: 'Vehicle details update failed',
        data: {
          manufacturer_created: 0,
          manufacturer_updated: 0,
          vehicles_created: 0,
          vehicles_updated: 0,
          specifications_created: 0,
          specifications_updated: 0,
          news_articles_added: 0,
          news_articles_skipped: 0,
          trims_processed: [],
          vehicle_ids: [],
          model_year_processed: ''
        },
        timestamp: new Date().toISOString(),
        source: 'update-vehicle-details-button',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
      setResult(errorResult)
      setShowResult(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getResultIcon = () => {
    if (!result) return null
    
    if (result.success) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getResultColor = () => {
    if (!result) return ''
    
    if (result.success) {
      return 'border-green-200 bg-green-50'
    } else {
      return 'border-red-200 bg-red-50'
    }
  }


  return (
    <div className={className}>
      <Button
        onClick={handleUpdateVehicleDetails}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating vehicle details...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Vehicle Details
          </>
        )}
      </Button>

      {showResult && result && (
        <Card className={`mt-4 border ${getResultColor()}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getResultIcon()}
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-2">
                  {result.message}
                </h4>
                
                {result.success && (
                  <div className="text-xs text-gray-600 space-y-3">
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          <Database className="w-3 h-3" />
                          <span>Manufacturers</span>
                        </div>
                        <div className="ml-4 space-y-1">
                          {result.data.manufacturer_created > 0 && (
                            <div className="text-green-600">+{result.data.manufacturer_created} created</div>
                          )}
                          {result.data.manufacturer_updated > 0 && (
                            <div className="text-blue-600">~{result.data.manufacturer_updated} updated</div>
                          )}
                          {result.data.manufacturer_created === 0 && result.data.manufacturer_updated === 0 && (
                            <div className="text-gray-500">No changes</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          <Car className="w-3 h-3" />
                          <span>Vehicles</span>
                        </div>
                        <div className="ml-4 space-y-1">
                          {result.data.vehicles_created > 0 && (
                            <div className="text-green-600">+{result.data.vehicles_created} created</div>
                          )}
                          {result.data.vehicles_updated > 0 && (
                            <div className="text-blue-600">~{result.data.vehicles_updated} updated</div>
                          )}
                          {result.data.vehicles_created === 0 && result.data.vehicles_updated === 0 && (
                            <div className="text-gray-500">No changes</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          <Database className="w-3 h-3" />
                          <span>Specifications</span>
                        </div>
                        <div className="ml-4 space-y-1">
                          {result.data.specifications_created > 0 && (
                            <div className="text-green-600">+{result.data.specifications_created} created</div>
                          )}
                          {result.data.specifications_updated > 0 && (
                            <div className="text-blue-600">~{result.data.specifications_updated} updated</div>
                          )}
                          {result.data.specifications_created === 0 && result.data.specifications_updated === 0 && (
                            <div className="text-gray-500">No changes</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          <Newspaper className="w-3 h-3" />
                          <span>News Articles</span>
                        </div>
                        <div className="ml-4 space-y-1">
                          {result.data.news_articles_added > 0 && (
                            <div className="text-green-600">+{result.data.news_articles_added} added</div>
                          )}
                          {result.data.news_articles_skipped > 0 && (
                            <div className="text-gray-500">~{result.data.news_articles_skipped} skipped</div>
                          )}
                          {result.data.news_articles_added === 0 && result.data.news_articles_skipped === 0 && (
                            <div className="text-gray-500">No changes</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Detailed Information */}
                    <div className="border-t pt-2 space-y-2">
                      {result.data.trims_processed.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Trims Processed:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.data.trims_processed.map((trim, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {trim}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {result.data.model_year_processed && (
                        <div>
                          <p className="font-medium text-gray-700">Model Year:</p>
                          <p className="text-gray-500">{result.data.model_year_processed}</p>
                        </div>
                      )}
                      
                      {result.data.vehicle_ids.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Updated Vehicles:</p>
                          <div className="space-y-1">
                            {result.data.vehicle_ids.map((vehicleId) => (
                              <Link 
                                key={vehicleId}
                                to={`/vehicles/${vehicleId}`}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors text-xs"
                              >
                                View Vehicle Details
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Attributes Summary */}
                    <div className="border-t pt-2">
                      <p className="font-medium text-gray-700 mb-2">Database Changes Summary:</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Total Records Modified:</span>
                          <span className="font-medium">
                            {result.data.manufacturer_created + result.data.manufacturer_updated + 
                             result.data.vehicles_created + result.data.vehicles_updated + 
                             result.data.specifications_created + result.data.specifications_updated + 
                             result.data.news_articles_added}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>New Records:</span>
                          <span className="text-green-600 font-medium">
                            {result.data.manufacturer_created + result.data.vehicles_created + 
                             result.data.specifications_created + result.data.news_articles_added}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Updated Records:</span>
                          <span className="text-blue-600 font-medium">
                            {result.data.manufacturer_updated + result.data.vehicles_updated + 
                             result.data.specifications_updated}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!result.success && result.error && (
                  <div className="mt-2">
                    <p className="font-medium text-red-600">Error:</p>
                    <p className="text-red-600 text-xs">{result.error}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UpdateVehicleDetailsButton
