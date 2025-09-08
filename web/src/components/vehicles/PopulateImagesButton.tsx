import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageIcon, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { ImagePopulationService, type ImagePopulationOptions, type ImagePopulationResult } from '@/services/image-population'
import { useAuth } from '@/contexts/AuthContext'

interface PopulateImagesButtonProps {
  vehicleId: string
  model: string
  trim?: string
  manufacturer?: string
  onImagesPopulated?: () => void
  className?: string
}

export const PopulateImagesButton: React.FC<PopulateImagesButtonProps> = ({
  vehicleId,
  model,
  trim,
  manufacturer,
  onImagesPopulated,
  className
}) => {
  const { isAdmin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImagePopulationResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Don't render if user is not admin
  if (!isAdmin) {
    return null
  }

  const handlePopulateImages = async () => {
    setIsLoading(true)
    setResult(null)
    setShowResult(false)

    console.log('PopulateImagesButton props:', {
      vehicleId,
      model,
      trim,
      manufacturer
    })

    try {
      const options: ImagePopulationOptions = {
        vehicleId,
        model,
        trim,
        manufacturer,
        maxImages: 8 // Limit to 8 images to avoid overwhelming the gallery
      }

      console.log('ImagePopulationOptions:', options)

      const populationResult = await ImagePopulationService.populateVehicleImages(options)
      setResult(populationResult)
      setShowResult(true)

      // Call the callback if images were successfully uploaded
      if (populationResult.success && populationResult.imagesUploaded > 0) {
        onImagesPopulated?.()
      }
    } catch (error) {
      const errorResult: ImagePopulationResult = {
        success: false,
        imagesUploaded: 0,
        imagesSearched: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        message: 'Image population failed'
      }
      setResult(errorResult)
      setShowResult(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getResultIcon = () => {
    if (!result) return null
    
    if (result.success && result.imagesUploaded > 0) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (result.success && result.imagesUploaded === 0) {
      return <AlertCircle className="w-5 h-5 text-yellow-600" />
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getResultColor = () => {
    if (!result) return ''
    
    if (result.success && result.imagesUploaded > 0) {
      return 'border-green-200 bg-green-50'
    } else if (result.success && result.imagesUploaded === 0) {
      return 'border-yellow-200 bg-yellow-50'
    } else {
      return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className={className}>
      <Button
        onClick={handlePopulateImages}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Searching for images...
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4 mr-2" />
            Populate Images
          </>
        )}
      </Button>

      {showResult && result && (
        <Card className={`mt-4 border ${getResultColor()}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getResultIcon()}
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">
                  {result.message}
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Images searched: {result.imagesSearched}</p>
                  <p>Images uploaded: {result.imagesUploaded}</p>
                  {result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-red-600">Errors:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index} className="text-red-600">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PopulateImagesButton
