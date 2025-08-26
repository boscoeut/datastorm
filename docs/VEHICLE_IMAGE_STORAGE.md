# Vehicle Image Storage System

## Overview
The Vehicle Image Storage System provides comprehensive image management capabilities for vehicles in the Electric Vehicle Data Hub. It uses Supabase Storage for file storage and includes both profile images and gallery images for each vehicle.

## Features

### Profile Images
- Single main image per vehicle
- Automatically displayed in vehicle lists and detail views
- Supports common image formats (JPEG, PNG, WebP)
- Maximum file size: 10MB

### Gallery Images
- Multiple additional images per vehicle
- Drag and drop reordering
- Image metadata storage (dimensions, file size, etc.)
- Soft delete functionality
- Maximum 20 images per vehicle

## Database Schema

### New Tables
- `vehicle_images` - Stores gallery image metadata and references

### Updated Tables
- `vehicles` - Added `profile_image_url` and `profile_image_path` columns

### Functions
- `get_vehicle_images(vehicle_id)` - Retrieves ordered gallery images
- `reorder_vehicle_images(vehicle_id, image_orders)` - Updates image display order

## Storage Structure

```
vehicle-images/
├── vehicles/
│   ├── {vehicle_id}/
│   │   ├── profile/
│   │   │   └── {timestamp}_{filename}
│   │   └── gallery/
│   │       ├── {timestamp}_{filename}
│   │       └── {timestamp}_{filename}
```

## Setup Instructions

### 1. Database Migration
Run the migration to create the necessary tables and functions:

```sql
-- Apply the migration
\i database/migrations/002_vehicle_image_storage.sql
```

### 2. Supabase Storage Configuration
The system automatically creates the `vehicle-images` bucket with the following settings:
- Public access enabled
- Maximum file size: 10MB
- Allowed MIME types: image/jpeg, image/png, image/webp

### 3. Frontend Integration
The system is automatically initialized when the app starts. No additional configuration is required.

## Usage

### Uploading Profile Images
```typescript
import { VehicleImageService } from '@/services/storage'

// Upload a profile image
const result = await VehicleImageService.uploadProfileImage(vehicleId, file)
if (result.success) {
  console.log('Profile image uploaded:', result.imageUrl)
}
```

### Uploading Gallery Images
```typescript
// Upload multiple gallery images
const result = await VehicleImageService.uploadImage({
  file,
  vehicleId,
  imageType: 'gallery',
  altText: 'Front view of the vehicle',
  displayOrder: 0
})
```

### Retrieving Images
```typescript
// Get all gallery images for a vehicle
const images = await VehicleImageService.getVehicleImages(vehicleId)

// Images are automatically ordered by display_order
images.forEach((image, index) => {
  console.log(`Image ${index + 1}:`, image.image_url)
})
```

### Managing Images
```typescript
// Delete a gallery image (soft delete)
const success = await VehicleImageService.deleteGalleryImage(imageId, imagePath)

// Reorder images
const imageOrders = [
  { id: 'image1-id', order: 0 },
  { id: 'image2-id', order: 1 }
]
const success = await VehicleImageService.reorderImages(vehicleId, imageOrders)
```

## UI Components

### ImageUpload
A reusable component for handling file uploads with drag and drop support.

```tsx
import ImageUpload from '@/components/ui/image-upload'

<ImageUpload
  onUpload={handleFiles}
  multiple={true}
  accept="image/*"
  maxFiles={20}
  maxSize={10 * 1024 * 1024}
  placeholder="Upload vehicle images"
/>
```

### VehicleImageGallery
A comprehensive component for managing vehicle images, including:
- Profile image upload and display
- Gallery image management
- Drag and drop reordering
- Image preview modal
- Delete functionality

```tsx
import VehicleImageGallery from '@/components/vehicles/VehicleImageGallery'

<VehicleImageGallery
  vehicleId={vehicle.id}
  profileImageUrl={vehicle.profile_image_url}
  onProfileImageUpdate={handleProfileUpdate}
/>
```

## Security

### Row Level Security (RLS)
- Profile images: Inherit vehicle permissions
- Gallery images: Read access for all, write/delete for authenticated users

### Storage Policies
- Public read access for all images
- Upload restricted to authenticated users
- File type and size validation

## Performance Considerations

### Image Optimization
- Images are stored in their original format
- Consider implementing image transformation for thumbnails
- Use appropriate image dimensions for different use cases

### Caching
- Storage URLs include cache control headers
- Consider CDN integration for production use

## Error Handling

The system includes comprehensive error handling for:
- File validation failures
- Upload errors
- Storage quota exceeded
- Network issues
- Database operation failures

## Monitoring

### Storage Usage
Monitor storage usage through Supabase dashboard:
- Storage bucket metrics
- File count and size statistics
- Access patterns

### Error Logging
All errors are logged to console with appropriate context for debugging.

## Troubleshooting

### Common Issues

1. **Storage bucket not found**
   - Ensure the migration has been applied
   - Check Supabase project permissions
   - Verify storage is enabled in your project

2. **Upload failures**
   - Check file size limits
   - Verify file type restrictions
   - Ensure user authentication

3. **Images not displaying**
   - Check storage bucket public access
   - Verify image URLs are correct
   - Check browser console for errors

### Debug Mode
Enable debug logging by setting the log level in your environment:

```typescript
// In development
localStorage.setItem('debug', 'vehicle-storage:*')
```

## Future Enhancements

- Image compression and optimization
- Thumbnail generation
- Bulk image operations
- Image tagging and categorization
- Advanced search and filtering
- Image analytics and usage tracking
