import { supabase } from '../lib/supabase'
import type { NewsArticle } from '../types/database'

export interface NewsImageUploadResult {
  success: boolean
  imageUrl?: string
  imagePath?: string
  error?: string
  metadata?: {
    width: number
    height: number
    fileSize: number
    mimeType: string
  }
}

export class NewsImageService {
  private static readonly BUCKET_NAME = 'news-images'
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpeg', 'image/png', 'image/webp']

  /**
   * Initialize storage bucket if it doesn't exist
   */
  static async initializeStorage(): Promise<void> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      if (error) {
        console.warn('Could not list storage buckets:', error.message)
        return
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME)
      if (!bucketExists) {
        console.log(`Creating storage bucket: ${this.BUCKET_NAME}`)
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: this.MAX_FILE_SIZE,
          allowedMimeTypes: this.ALLOWED_TYPES
        })
        if (createError) {
          console.warn(`Could not create bucket ${this.BUCKET_NAME}:`, createError.message)
        } else {
          console.log(`Successfully created bucket: ${this.BUCKET_NAME}`)
        }
      } else {
        console.log(`Storage bucket ${this.BUCKET_NAME} already exists`)
      }
    } catch (error) {
      console.warn('Storage initialization warning:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Download and store an image from a URL
   */
  static async downloadAndStoreImage(
    imageUrl: string, 
    articleId: string, 
    articleTitle: string
  ): Promise<NewsImageUploadResult> {
    try {
      console.log('🖼️ Downloading image from:', imageUrl)
      
      // Validate URL
      if (!imageUrl || !imageUrl.startsWith('http')) {
        throw new Error('Invalid image URL')
      }

      // Download the image with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
          'Accept': 'image/*',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !this.ALLOWED_TYPES.includes(contentType)) {
        throw new Error(`Unsupported image type: ${contentType}`)
      }

      const imageData = await response.arrayBuffer()
      const fileSize = imageData.byteLength

      if (fileSize > this.MAX_FILE_SIZE) {
        throw new Error(`Image too large: ${fileSize} bytes`)
      }

      if (fileSize < 1024) { // Less than 1KB
        throw new Error('Image too small, likely not a valid image')
      }

      // Generate file path
      const filePath = this.generateFilePath(articleId, articleTitle, contentType)
      
      // Convert ArrayBuffer to Blob
      const blob = new Blob([imageData], { type: contentType })
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true // Allow overwriting if file exists
        })

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      // Get image metadata
      const metadata = await this.getImageMetadata(blob, contentType)

      return {
        success: true,
        imageUrl: urlData.publicUrl,
        imagePath: filePath,
        metadata
      }
    } catch (error) {
      console.error('Failed to download and store image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      }
    }
  }

  /**
   * Update news article with image information
   */
  static async updateArticleImage(
    articleId: string,
    imageUrl: string,
    imagePath: string,
    imageName: string,
    metadata: { width: number; height: number; fileSize: number; mimeType: string }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({
          image_url: imageUrl,
          image_path: imagePath,
          image_name: imageName,
          image_size: metadata.fileSize,
          image_width: metadata.width,
          image_height: metadata.height,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId)

      if (error) {
        console.error('Failed to update article with image:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to update article with image:', error)
      return false
    }
  }

  /**
   * Get the public URL for a news article image
   */
  static getImageUrl(article: NewsArticle): string | null {
    // Prefer local stored image over external URL
    if (article.image_path) {
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(article.image_path)
      return data.publicUrl
    }
    
    // Fallback to external URL if no local image
    return article.image_url || null
  }

  /**
   * Delete a news article image
   */
  static async deleteArticleImage(articleId: string, imagePath: string): Promise<boolean> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([imagePath])

      if (storageError) {
        console.error('Failed to delete image from storage:', storageError)
        return false
      }

      // Update article to remove image references
      const { error: dbError } = await supabase
        .from('news_articles')
        .update({
          image_url: null,
          image_path: null,
          image_name: null,
          image_size: null,
          image_width: null,
          image_height: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId)

      if (dbError) {
        console.error('Failed to update article after image deletion:', dbError)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to delete article image:', error)
      return false
    }
  }

  /**
   * Generate file path for storage
   */
  private static generateFilePath(articleId: string, articleTitle: string, contentType: string): string {
    const timestamp = Date.now()
    const sanitizedTitle = articleTitle.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50)
    const extension = contentType.split('/')[1] || 'jpg'
    const fileName = `${timestamp}_${sanitizedTitle}.${extension}`
    
    return `articles/${articleId}/${fileName}`
  }

  /**
   * Get image metadata (dimensions, etc.)
   */
  private static async getImageMetadata(blob: Blob, mimeType: string): Promise<{ width: number; height: number; fileSize: number; mimeType: string }> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(blob)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.width,
          height: img.height,
          fileSize: blob.size,
          mimeType: mimeType
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: 0,
          height: 0,
          fileSize: blob.size,
          mimeType: mimeType
        })
      }
      
      img.src = url
    })
  }
}
