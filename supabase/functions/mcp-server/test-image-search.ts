// Test script for image search functionality
import { searchArticleImage } from './news-fetcher.ts'

async function testImageSearch() {
  console.log('🧪 Testing image search functionality...')
  
  try {
    // Test with a sample article title
    const testTitle = 'Tesla Model 3 2024 Review'
    const testUrl = 'https://example.com/tesla-model-3-review'
    
    console.log(`Searching for image for: "${testTitle}"`)
    const imageUrl = await searchArticleImage(testTitle, testUrl)
    
    if (imageUrl) {
      console.log('✅ Image found:', imageUrl)
    } else {
      console.log('❌ No image found')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testImageSearch()
