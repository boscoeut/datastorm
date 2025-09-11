#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Test script for the updated vehicle-updater with grounded Gemini
 * This script tests the new web grounding functionality
 */

import { updateVehicleDetails } from './vehicle-updater.ts';

// Test configuration
const TEST_CONFIG = {
  supabaseUrl: Deno.env.get('SUPABASE_URL') || 'https://your-project.supabase.co',
  supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'your-service-key',
  testVehicle: {
    manufacturer: 'Tesla',
    model: 'Model 3',
    year: 2024
  }
};

async function testGroundedVehicleUpdater() {
  console.log('🧪 Testing grounded vehicle updater...');
  console.log('📋 Test configuration:', TEST_CONFIG.testVehicle);
  
  try {
    // Test the vehicle update with grounded Gemini
    const result = await updateVehicleDetails(
      TEST_CONFIG.testVehicle,
      TEST_CONFIG.supabaseUrl,
      TEST_CONFIG.supabaseServiceKey
    );
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    // Validate the result structure
    if (result.success) {
      console.log('🎉 Vehicle update was successful!');
      console.log(`📈 Statistics:`);
      console.log(`   - Manufacturers created: ${result.data.manufacturer_created}`);
      console.log(`   - Manufacturers updated: ${result.data.manufacturer_updated}`);
      console.log(`   - Vehicles created: ${result.data.vehicles_created}`);
      console.log(`   - Vehicles updated: ${result.data.vehicles_updated}`);
      console.log(`   - Specifications created: ${result.data.specifications_created}`);
      console.log(`   - Specifications updated: ${result.data.specifications_updated}`);
      console.log(`   - Trims processed: ${result.data.trims_processed.join(', ')}`);
      console.log(`   - Model year processed: ${result.data.model_year_processed}`);
    } else {
      console.error('❌ Vehicle update failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
if (import.meta.main) {
  await testGroundedVehicleUpdater();
}
