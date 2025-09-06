import React, { useState, useEffect } from 'react'
import { X, Trash2, Move, Image as ImageIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import type { VehicleImage } from '../../types/database'
import { VehicleImageService } from '../../services/storage'
import { useAuth } from '../../contexts/AuthContext'
import ImageUpload from '../ui/image-upload'

interface VehicleImageGalleryProps {
  vehicleId: string
  profileImageUrl?: string
  onProfileImageUpdate?: (imageUrl: string) => void
  className?: string
}

export const VehicleImageGallery: React.FC<VehicleImageGalleryProps> = ({
  vehicleId,
  profileImageUrl,
  onProfileImageUpdate,
  className
}) => {
  const { isAdmin } = useAuth()
  const [galleryImages, setGalleryImages] = useState<VehicleImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<VehicleImage | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    loadGalleryImages()
  }, [vehicleId])

  const loadGalleryImages = async () => {
    try {
      const images = await VehicleImageService.getVehicleImages(vehicleId)
      setGalleryImages(images)
    } catch (error) {
      console.error('Failed to load gallery images:', error)
    }
  }

  const handleProfileImageUpload = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const result = await VehicleImageService.uploadProfileImage(vehicleId, files[0])
      if (result.success && result.imageUrl) {
        onProfileImageUpdate?.(result.imageUrl)
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleGalleryImageUpload = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        await VehicleImageService.uploadImage({
          file,
          vehicleId,
          imageType: 'gallery',
          displayOrder: galleryImages.length
        })
      }
      await loadGalleryImages()
    } catch (error) {
      console.error('Failed to upload gallery images:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (image: VehicleImage) => {
    try {
      const success = await VehicleImageService.deleteGalleryImage(image.id, image.image_path)
      if (success) {
        await loadGalleryImages()
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }

  const handleReorderImages = async (newOrder: VehicleImage[]) => {
    try {
      const imageOrders = newOrder.map((image, index) => ({
        id: image.id,
        order: index
      }))
      
      const success = await VehicleImageService.reorderImages(vehicleId, imageOrders)
      if (success) {
        setGalleryImages(newOrder)
      }
    } catch (error) {
      console.error('Failed to reorder images:', error)
    }
  }

  const openImageModal = (image: VehicleImage) => {
    setSelectedImage(image)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedImage(null)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Image Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Profile Image */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Image</h4>
            {profileImageUrl ? (
              <div className="relative group">
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => {
                    // Create a mock VehicleImage object for the profile image
                    const profileImageData: VehicleImage = {
                      id: 'profile-image',
                      vehicle_id: vehicleId,
                      image_url: profileImageUrl,
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
                        vehicle_id: vehicleId,
                        image_url: profileImageUrl,
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
                    <ImageIcon className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No profile image</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Image Upload - Admin Only */}
          {isAdmin && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload New Image</h4>
              <ImageUpload
                onUpload={handleProfileImageUpload}
                multiple={false}
                accept="image/*"
                maxSize={10 * 1024 * 1024}
                disabled={isUploading}
                placeholder="Upload profile image"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Gallery Images Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Gallery Images</h3>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReordering(!isReordering)}
              className={isReordering ? 'bg-blue-100 text-blue-700' : ''}
            >
              <Move className="w-4 h-4 mr-2" />
              {isReordering ? 'Done' : 'Reorder'}
            </Button>
          )}
        </div>

        {/* Gallery Upload - Admin Only */}
        {isAdmin && (
          <div className="mb-6">
            <ImageUpload
              onUpload={handleGalleryImageUpload}
              multiple={true}
              accept="image/*"
              maxFiles={20}
              maxSize={10 * 1024 * 1024}
              disabled={isUploading}
              placeholder="Upload gallery images (drag multiple files)"
            />
          </div>
        )}

        {/* Gallery Grid */}
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className={`relative group cursor-pointer ${
                  isReordering ? 'cursor-move' : ''
                }`}
                draggable={isReordering}
                onDragStart={(e) => {
                  if (isReordering) {
                    e.dataTransfer.setData('text/plain', index.toString())
                  }
                }}
                onDragOver={(e) => {
                  if (isReordering) {
                    e.preventDefault()
                  }
                }}
                onDrop={(e) => {
                  if (isReordering) {
                    e.preventDefault()
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                    const toIndex = index
                    if (fromIndex !== toIndex) {
                      const newOrder = [...galleryImages]
                      const [movedItem] = newOrder.splice(fromIndex, 1)
                      newOrder.splice(toIndex, 0, movedItem)
                      handleReorderImages(newOrder)
                    }
                  }
                }}
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text || image.image_name}
                  className="w-full h-32 object-cover rounded-lg"
                  onClick={() => !isReordering && openImageModal(image)}
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    {!isReordering && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white text-gray-900 hover:bg-gray-100"
                          onClick={() => openImageModal(image)}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteImage(image)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Order Badge */}
                {isReordering && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No gallery images yet</p>
            <p className="text-sm">Upload some images to get started</p>
          </div>
        )}
      </Card>

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

export default VehicleImageGallery
