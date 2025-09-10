import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SpecificationTable from './SpecificationTable'
import VehicleImageGallery from './VehicleImageGallery'
import PopulateImagesButton from './PopulateImagesButton'
import UpdateVehicleDetailsButton from './UpdateVehicleDetailsButton'
import { VehicleService } from '@/services/database'
import type { VehicleWithDetails, VehicleImage } from '@/types/database'

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  
  const [vehicle, setVehicle] = useState<VehicleWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<VehicleImage | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0)

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) {
        setError('Vehicle ID is required')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await VehicleService.getWithDetails(id)
        
        if (result.error) {
          setError(result.error.message)
          setVehicle(null)
        } else {
          setVehicle(result.data)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle details')
        setVehicle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleDetails()
  }, [id])


  const handleProfileImageUpdate = (imageUrl: string) => {
    if (vehicle) {
      setVehicle({
        ...vehicle,
        profile_image_url: imageUrl
      })
    }
  }

  const openImageModal = (imageData: VehicleImage) => {
    setSelectedImage(imageData)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedImage(null)
  }

  const handleImagesPopulated = () => {
    // Refresh the gallery by updating the key
    setGalleryRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading vehicle details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error || 'Vehicle not found'}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const specs = vehicle.specifications
  const manufacturer = vehicle.manufacturer

  return (
    <div className="space-y-6">

      {/* Vehicle Header with Profile Image */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Image */}
            <div className="lg:col-span-1">
              {vehicle.profile_image_url ? (
                <div className="relative group">
                  <img
                    src={vehicle.profile_image_url}
                    alt={`${manufacturer?.name || 'Unknown'} ${vehicle.model}`}
                    className="w-full h-64 object-cover rounded-lg shadow-lg cursor-pointer"
                    onClick={() => {
                      // Create a mock VehicleImage object for the profile image
                      const profileImageData: VehicleImage = {
                        id: 'profile-image',
                        vehicle_id: vehicle.id,
                        image_url: vehicle.profile_image_url || '',
                        image_path: '',
                        image_name: 'Profile Image',
                        image_type: 'image/jpeg',
                        file_size: 0,
                        width: 0,
                        height: 0,
                        alt_text: 'Profile Image',
                        display_order: 0,
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      }
                      openImageModal(profileImageData)
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 hover:bg-gray-100"
                      onClick={() => {
                        // Create a mock VehicleImage object for the profile image
                        const profileImageData: VehicleImage = {
                          id: 'profile-image',
                          vehicle_id: vehicle.id,
                          image_url: vehicle.profile_image_url || '',
                          image_path: '',
                          image_name: 'Profile Image',
                          image_type: 'image/jpeg',
                          file_size: 0,
                          width: 0,
                          height: 0,
                          alt_text: 'Profile Image',
                          display_order: 0,
                          is_active: true,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        }
                        openImageModal(profileImageData)
                      }}
                    >
                      View Full Size
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🚗</span>
                    </div>
                    <p>No profile image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold text-foreground">
                  {manufacturer?.name || 'Unknown'} {vehicle.model}
                </h1>
                {vehicle.trim && (
                  <p className="text-xl text-muted-foreground mt-2">{vehicle.trim}</p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  {vehicle.body_style || 'N/A'}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    vehicle.is_electric
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}
                >
                  {vehicle.is_electric ? '⚡ Electric' : '🔋 Hybrid/Other'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Current Model
                </span>
              </div>

              {/* Quick Specs Preview */}
              {specs && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
                  {specs.range_miles && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{specs.range_miles}</div>
                      <div className="text-xs text-muted-foreground">Miles Range</div>
                    </div>
                  )}
                  {specs.power_hp && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{specs.power_hp}</div>
                      <div className="text-xs text-muted-foreground">Horsepower</div>
                    </div>
                  )}
                  {specs.acceleration_0_60 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{specs.acceleration_0_60}s</div>
                      <div className="text-xs text-muted-foreground">0-60 mph</div>
                    </div>
                  )}
                  {specs.battery_capacity_kwh && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{specs.battery_capacity_kwh}</div>
                      <div className="text-xs text-muted-foreground">kWh Battery</div>
                    </div>
                  )}
                  {specs.msrp_usd && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(specs.msrp_usd)}
                      </div>
                      <div className="text-xs text-muted-foreground">Starting MSRP</div>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Populate Images Button */}
              <div className="pt-4">
                <PopulateImagesButton
                  vehicleId={vehicle.id}
                  model={vehicle.model}
                  trim={vehicle.trim}
                  manufacturer={manufacturer?.name}
                  onImagesPopulated={handleImagesPopulated}
                />
              </div>

              {/* Admin Update Vehicle Details Button */}
              <div className="pt-2">
                <UpdateVehicleDetailsButton
                  manufacturer={manufacturer?.name || ''}
                  model={vehicle.model}
                  trim={vehicle.trim}
                  year={vehicle.year}
                  onDetailsUpdated={() => {
                    // Refresh the vehicle details after update
                    window.location.reload()
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Images Gallery */}
      <VehicleImageGallery
        key={galleryRefreshKey}
        vehicleId={vehicle.id}
        profileImageUrl={vehicle.profile_image_url}
        onProfileImageUpdate={handleProfileImageUpdate}
      />

      {/* Vehicle Specifications */}
      <SpecificationTable 
        specifications={specs}
        manufacturer={manufacturer}
        isElectric={vehicle.is_electric}
        loading={false}
        error={null}
      />

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white text-gray-900 hover:bg-gray-100"
              onClick={closeImageModal}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.alt_text || selectedImage.image_name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <p className="font-medium">{selectedImage.image_name}</p>
              {selectedImage.alt_text && (
                <p className="text-sm text-gray-300">{selectedImage.alt_text}</p>
              )}
              <p className="text-xs text-gray-400">
                {selectedImage.width} × {selectedImage.height} • 
                {selectedImage.file_size ? (selectedImage.file_size / (1024 * 1024)).toFixed(2) : 'Unknown'} MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VehicleDetail
