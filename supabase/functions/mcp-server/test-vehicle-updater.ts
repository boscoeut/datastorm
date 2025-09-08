#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Test script for the vehicle-updater functionality
 * This script tests the update-vehicle-details tool without requiring full MCP setup
 */

import { updateVehicleDetails, VehicleUpdateParams } from './vehicle-updater.ts'

// Test configuration
const TEST_PARAMS: VehicleUpdateParams = {
  manufacturer: 'Tesla',
  model: 'Model 3',
  trim: 'Performance',
  year: 2025
}

// Environment variables (these should be set in your Supabase project)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

async function testVehicleUpdater() {
  console.log('🧪 Testing Vehicle Updater Functionality')
  console.log('=====================================')
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:')
    console.error('   SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
    console.error('')
    console.error('Please set these environment variables and try again.')
    return
  }

  console.log('📋 Test Parameters:')
  console.log('   Manufacturer:', TEST_PARAMS.manufacturer)
  console.log('   Model:', TEST_PARAMS.model)
  console.log('   Trim:', TEST_PARAMS.trim)
  console.log('   Year:', TEST_PARAMS.year)
  console.log('')

  try {
    console.log('🚀 Starting vehicle update process...')
    const startTime = Date.now()
    
    const result = await updateVehicleDetails(
      TEST_PARAMS,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log('')
    console.log('📊 Results:')
    console.log('   Success:', result.success ? '✅' : '❌')
    console.log('   Message:', result.message)
    console.log('   Duration:', `${duration}ms`)
    console.log('')
    
    if (result.success) {
      console.log('📈 Statistics:')
      console.log('   Manufacturers created:', result.data.manufacturer_created)
      console.log('   Manufacturers updated:', result.data.manufacturer_updated)
      console.log('   Vehicles created:', result.data.vehicles_created)
      console.log('   Vehicles updated:', result.data.vehicles_updated)
      console.log('   Specifications created:', result.data.specifications_created)
      console.log('   Specifications updated:', result.data.specifications_updated)
      console.log('   News articles added:', result.data.news_articles_added)
      console.log('   News articles skipped:', result.data.news_articles_skipped)
      console.log('   Trims processed:', result.data.trims_processed.join(', '))
      console.log('   Model year processed:', result.data.model_year_processed)
      console.log('   Vehicle IDs:', result.data.vehicle_ids.join(', '))
    } else {
      console.log('❌ Error:', result.error)
    }
    
    console.log('')
    console.log('🎉 Test completed!')
    
  } catch (error) {
    console.error('💥 Test failed with error:', error)
    console.error('')
    console.error('Stack trace:')
    console.error(error instanceof Error ? error.stack : 'No stack trace available')
  }
}

// Run the test
if (import.meta.main) {
  await testVehicleUpdater()
}
