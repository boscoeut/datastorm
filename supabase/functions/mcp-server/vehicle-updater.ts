import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1'

// Types for vehicle update functionality
export interface VehicleUpdateParams {
  manufacturer: string
  model: string
  trim?: string
  year?: number
}

export interface VehicleData {
  manufacturer: {
    name: string
    country?: string
    website?: string
  }
  vehicles: Array<{
    model: string
    year: number
    model_year: number
    trim?: string
    body_style?: string
    is_electric: boolean
    is_currently_available: boolean
  }>
  specifications: Array<{
    battery_capacity_kwh?: number
    range_miles?: number
    power_hp?: number
    torque_lb_ft?: number
    acceleration_0_60?: number
    top_speed_mph?: number
    weight_lbs?: number
    length_inches?: number
    width_inches?: number
    height_inches?: number
    cargo_capacity_cu_ft?: number
    seating_capacity?: number
    towing_capacity_lbs?: number
    drag_coefficient?: number
    charging_speed_kw?: number
    msrp_usd?: number
  }>
}

export interface VehicleUpdateResult {
  success: boolean
  message: string
  data: {
    manufacturer_created: number
    manufacturer_updated: number
    vehicles_created: number
    vehicles_updated: number
    specifications_created: number
    specifications_updated: number
    trims_processed: string[]
    vehicle_ids: string[]
    model_year_processed: string
  }
  timestamp: string
  source: string
  error?: string
}

// Web grounding types for Gemini
interface WebGroundingConfig {
  enableWebSearch: boolean;
  maxSearchResults?: number;
}

// Web grounding configuration
const WEB_GROUNDING_CONFIG: WebGroundingConfig = {
  enableWebSearch: true,
  maxSearchResults: 20
};

// Enhanced Gemini API function with web grounding
async function callGeminiAPI(request: {
  task: string;
  prompt: string;
  data?: Record<string, any>;
  expectedOutput?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableWebGrounding?: boolean;
}): Promise<{ text: string; usage?: any; groundingMetadata?: any }> {
  try {
    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    // Initialize Google Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Prepare the content with expected output guidance
    let content = request.prompt;
    
    // Add expected output guidance if provided
    if (request.expectedOutput) {
      content += `\n\nPlease provide your response in the following format: ${request.expectedOutput}`;
    }
    
    // Add context data if provided
    if (request.data) {
      content += `\n\nContext Data: ${JSON.stringify(request.data, null, 2)}`;
    }

    // Configure the model
    const model = genAI.getGenerativeModel({
      model: request.model || 'gemini-2.5-flash',
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 2048,
      },
    });

    // Generate content with web grounding
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: content }] }],
      tools: request.enableWebGrounding !== false ? [{
        googleSearch: {}
      }] : undefined
    });

    const response = await result.response;
    const text = response.text();

    // Get usage information if available
    const usage = response.usageMetadata ? {
      promptTokens: response.usageMetadata.promptTokenCount || 0,
      completionTokens: response.usageMetadata.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata.totalTokenCount || 0,
    } : undefined;

    // Get grounding metadata if available
    const groundingMetadata = response.groundingMetadata ? {
      groundingChunks: response.groundingMetadata.groundingChunks || [],
      searchQueries: response.groundingMetadata.searchQueries || [],
      retrievalScore: response.groundingMetadata.retrievalScore || 0,
      webSearchQueries: response.groundingMetadata.webSearchQueries || []
    } : undefined;

    return {
      text,
      usage,
      groundingMetadata,
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Main vehicle update function
export async function updateVehicleDetails(
  params: VehicleUpdateParams,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<VehicleUpdateResult> {
  console.log('🚗 Starting vehicle update process for:', params);
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Initialize counters
  const counters = {
    manufacturer_created: 0,
    manufacturer_updated: 0,
    vehicles_created: 0,
    vehicles_updated: 0,
    specifications_created: 0,
    specifications_updated: 0,
    trims_processed: [] as string[],
    vehicle_ids: [] as string[],
    model_year_processed: ''
  };

  try {
    // Step 1: Research vehicle information using Google Search
    console.log('🔍 Researching vehicle information...');
    const vehicleData = await researchVehicleInformation(params);
    counters.model_year_processed = vehicleData.vehicles[0]?.year?.toString() || '';

    // Step 2: Update/Create manufacturer
    console.log('🏭 Processing manufacturer...');
    const manufacturerResult = await processManufacturer(vehicleData.manufacturer, supabase);
    counters.manufacturer_created += manufacturerResult.created;
    counters.manufacturer_updated += manufacturerResult.updated;

    // Step 3: Process vehicles and specifications
    console.log('🚙 Processing vehicles and specifications...');
    for (const vehicle of vehicleData.vehicles) {
      const vehicleResult = await processVehicle(
        vehicle,
        manufacturerResult.manufacturer_id,
        vehicleData.specifications[0] || {},
        supabase
      );
      
      counters.vehicles_created += vehicleResult.vehicles_created;
      counters.vehicles_updated += vehicleResult.vehicles_updated;
      counters.specifications_created += vehicleResult.specifications_created;
      counters.specifications_updated += vehicleResult.specifications_updated;
      counters.trims_processed.push(vehicle.trim || 'Base');
      counters.vehicle_ids.push(vehicleResult.vehicle_id);
    }


    const result: VehicleUpdateResult = {
      success: true,
      message: `Vehicle details updated successfully for ${params.manufacturer} ${params.model}`,
      data: counters,
      timestamp: new Date().toISOString(),
      source: 'mcp-server-vehicle-updater'
    };

    console.log('✅ Vehicle update completed successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error in vehicle update process:', error);
    
    return {
      success: false,
      message: 'Vehicle update failed',
      data: counters,
      timestamp: new Date().toISOString(),
      source: 'mcp-server-vehicle-updater',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Research vehicle information using grounded Gemini
async function researchVehicleInformation(params: VehicleUpdateParams): Promise<VehicleData> {
  console.log('🔍 Researching vehicle information for:', params);
  
  // Determine the most recent model year (prioritize current year or next year)
  const currentYear = new Date().getFullYear();
  const targetYear = params.year || currentYear;
  
  // Use grounded Gemini to research vehicle information
  const vehicleData = await researchVehicleWithGroundedGemini(params, targetYear);

  return vehicleData;
}

// Research vehicle information using grounded Gemini
async function researchVehicleWithGroundedGemini(
  params: VehicleUpdateParams,
  targetYear: number
): Promise<VehicleData> {
  console.log('📊 Researching vehicle data using grounded Gemini...');

  // Use grounded Gemini to extract all vehicle data in one comprehensive call
  const comprehensivePrompt = `Research comprehensive information about ${params.manufacturer} ${params.model} ${targetYear} electric vehicle.

Please provide detailed information about:

1. MANUFACTURER INFORMATION:
   - Company name: ${params.manufacturer}
   - Country where headquartered
   - Official website URL

2. VEHICLE INFORMATION:
   - Model name: ${params.model}
   - Model year: ${targetYear}
   - Available trim levels (e.g., Base, Performance, Long Range)
   - Body style (Sedan, SUV, Truck, etc.)
   - Electric vehicle status
   - Current availability status

3. SPECIFICATIONS:
   - Battery capacity (kWh)
   - EPA range (miles)
   - Power output (hp)
   - Torque (lb-ft)
   - 0-60 mph acceleration time
   - Top speed (mph)
   - Weight (lbs)
   - Physical dimensions (length, width, height in inches)
   - Cargo capacity (cubic feet)
   - Seating capacity
   - Towing capacity (lbs)
   - Drag coefficient
   - Charging speed (kW)
   - MSRP/starting price (USD)

Please search for the most current and accurate information available online.`;

  const response = await callGeminiAPI({
    task: 'research_vehicle_data',
    prompt: comprehensivePrompt,
    enableWebGrounding: true,
    temperature: 0.3,
    maxTokens: 4096
  });

  console.log('🔍 Grounded Gemini response received');
  console.log('📊 Grounding metadata:', response.groundingMetadata);

  // Extract structured data from the grounded response
  const vehicleData = await extractStructuredDataFromGroundedResponse(
    response.text,
    params,
    targetYear
  );

  return vehicleData;
}

// Extract structured data from grounded Gemini response
async function extractStructuredDataFromGroundedResponse(
  responseText: string,
  params: VehicleUpdateParams,
  targetYear: number
): Promise<VehicleData> {
  console.log('📊 Extracting structured data from grounded response...');

  // Use Gemini to parse the grounded response into structured JSON
  const parsePrompt = `Parse the following research response about ${params.manufacturer} ${params.model} ${targetYear} into structured JSON data.

RESEARCH RESPONSE:
${responseText}

Please extract and return ONLY a valid JSON object with this exact structure. Do not include any markdown formatting, code blocks, or additional text - just the raw JSON:

{
  "manufacturer": {
    "name": "${params.manufacturer}",
    "country": "Country where headquartered",
    "website": "Official website URL"
  },
  "vehicles": [
    {
      "model": "${params.model}",
      "year": ${targetYear},
      "model_year": ${targetYear},
      "trim": "Trim level (e.g., Base, Performance, Long Range)",
      "body_style": "Body style (Sedan, SUV, Truck, etc.)",
      "is_electric": true,
      "is_currently_available": true
    }
  ],
  "specifications": [
    {
      "battery_capacity_kwh": number,
      "range_miles": number,
      "power_hp": number,
      "torque_lb_ft": number,
      "acceleration_0_60": number,
      "top_speed_mph": number,
      "weight_lbs": number,
      "length_inches": number,
      "width_inches": number,
      "height_inches": number,
      "cargo_capacity_cu_ft": number,
      "seating_capacity": number,
      "towing_capacity_lbs": number,
      "drag_coefficient": number,
      "charging_speed_kw": number,
      "msrp_usd": number
    }
  ]
}

Rules:
- Return an array for vehicles even if only one vehicle
- If multiple trims are mentioned, create separate vehicle objects for each
- Omit specification fields that are not available (don't include null values)
- Use reasonable defaults if specific information is not available
- Ensure all JSON is properly formatted and valid`;

  try {
    const parseResponse = await callGeminiAPI({
      task: 'parse_grounded_response',
      prompt: parsePrompt,
      enableWebGrounding: false, // Don't use grounding for parsing
      temperature: 0.1,
      maxTokens: 2048
    });

    // Clean the response text to extract JSON
    let responseText = parseResponse.text.trim();
    
    // Remove any markdown code blocks
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to find JSON object in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }
    
    console.log('Parsing grounded response data:', responseText);
    const data = JSON.parse(responseText);
    
    // Validate the parsed data structure
    if (!data.manufacturer || !data.vehicles || !data.specifications) {
      throw new Error('Invalid data structure in grounded response');
    }
    
    // Ensure vehicles is an array
    if (!Array.isArray(data.vehicles)) {
      data.vehicles = [data.vehicles];
    }
    
    // Ensure specifications is an array
    if (!Array.isArray(data.specifications)) {
      data.specifications = [data.specifications];
    }
    
    // Filter out null/undefined values from specifications
    data.specifications = data.specifications.map((spec: any) => 
      Object.fromEntries(
        Object.entries(spec).filter(([_, value]) => value !== null && value !== undefined)
      )
    );
    
    console.log('✅ Successfully extracted structured data from grounded response');
    return data;
  } catch (error) {
    console.warn('Failed to parse grounded response, using fallback extraction:', error);
    return await getFallbackVehicleDataFromGroundedResponse(params, targetYear);
  }
}

// Fallback function to extract data when parsing fails
async function getFallbackVehicleDataFromGroundedResponse(
  params: VehicleUpdateParams,
  targetYear: number
): Promise<VehicleData> {
  console.log('🔄 Using fallback data extraction...');
  
  return {
    manufacturer: {
      name: params.manufacturer,
      country: 'Unknown',
      website: ''
    },
    vehicles: [{
      model: params.model,
      year: targetYear,
      model_year: targetYear,
      trim: params.trim || 'Base',
      body_style: 'Sedan',
      is_electric: true,
      is_currently_available: true
    }],
    specifications: [{}]
  };
}

// Database processing functions
async function processManufacturer(manufacturer: any, supabase: any) {
  console.log('🏭 Processing manufacturer:', manufacturer.name);
  
  // Check if manufacturer exists
  const { data: existingManufacturer, error: checkError } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('name', manufacturer.name)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Error checking manufacturer: ${checkError.message}`);
  }

  if (existingManufacturer) {
    // Update existing manufacturer
    const { error: updateError } = await supabase
      .from('manufacturers')
      .update({
        country: manufacturer.country,
        website: manufacturer.website,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingManufacturer.id);

    if (updateError) {
      throw new Error(`Error updating manufacturer: ${updateError.message}`);
    }

    console.log('✅ Manufacturer updated:', manufacturer.name);
    return { manufacturer_id: existingManufacturer.id, created: 0, updated: 1 };
  } else {
    // Create new manufacturer
    const { data: newManufacturer, error: createError } = await supabase
      .from('manufacturers')
      .insert([{
        name: manufacturer.name,
        country: manufacturer.country,
        website: manufacturer.website,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      throw new Error(`Error creating manufacturer: ${createError.message}`);
    }

    console.log('✅ Manufacturer created:', manufacturer.name);
    return { manufacturer_id: newManufacturer.id, created: 1, updated: 0 };
  }
}

async function processVehicle(vehicle: any, manufacturerId: string, specifications: any, supabase: any) {
  console.log('🚙 Processing vehicle:', vehicle.model, vehicle.trim);
  
  // Check if vehicle exists
  const { data: existingVehicle, error: checkError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('manufacturer_id', manufacturerId)
    .eq('model', vehicle.model)
    .eq('trim', vehicle.trim || 'Base')
    .eq('is_currently_available', true)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Error checking vehicle: ${checkError.message}`);
  }

  let vehicleId: string;
  let vehicles_created = 0;
  let vehicles_updated = 0;

  if (existingVehicle) {
    // Update existing vehicle
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        year: vehicle.year,
        model_year: vehicle.model_year,
        body_style: vehicle.body_style,
        is_electric: vehicle.is_electric,
        is_currently_available: vehicle.is_currently_available,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingVehicle.id);

    if (updateError) {
      throw new Error(`Error updating vehicle: ${updateError.message}`);
    }

    vehicleId = existingVehicle.id;
    vehicles_updated = 1;
    console.log('✅ Vehicle updated:', vehicle.model, vehicle.trim);
  } else {
    // Create new vehicle
    const { data: newVehicle, error: createError } = await supabase
      .from('vehicles')
      .insert([{
        manufacturer_id: manufacturerId,
        model: vehicle.model,
        year: vehicle.year,
        model_year: vehicle.model_year,
        trim: vehicle.trim || 'Base',
        body_style: vehicle.body_style,
        is_electric: vehicle.is_electric,
        is_currently_available: vehicle.is_currently_available,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      throw new Error(`Error creating vehicle: ${createError.message}`);
    }

    vehicleId = newVehicle.id;
    vehicles_created = 1;
    console.log('✅ Vehicle created:', vehicle.model, vehicle.trim);
  }

  // Process specifications
  const specResult = await processSpecifications(vehicleId, specifications, supabase);

  return {
    vehicle_id: vehicleId,
    vehicles_created,
    vehicles_updated,
    specifications_created: specResult.created,
    specifications_updated: specResult.updated
  };
}

async function processSpecifications(vehicleId: string, specifications: any, supabase: any) {
  console.log('📊 Processing specifications for vehicle:', vehicleId);
  
  // Check if specifications exist
  const { data: existingSpecs, error: checkError } = await supabase
    .from('vehicle_specifications')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Error checking specifications: ${checkError.message}`);
  }

  if (existingSpecs) {
    // Update existing specifications
    const { error: updateError } = await supabase
      .from('vehicle_specifications')
      .update({
        ...specifications,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSpecs.id);

    if (updateError) {
      throw new Error(`Error updating specifications: ${updateError.message}`);
    }

    console.log('✅ Specifications updated for vehicle:', vehicleId);
    return { created: 0, updated: 1 };
  } else {
    // Create new specifications
    const { error: createError } = await supabase
      .from('vehicle_specifications')
      .insert([{
        vehicle_id: vehicleId,
        ...specifications,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (createError) {
      throw new Error(`Error creating specifications: ${createError.message}`);
    }

    console.log('✅ Specifications created for vehicle:', vehicleId);
    return { created: 1, updated: 0 };
  }
}

