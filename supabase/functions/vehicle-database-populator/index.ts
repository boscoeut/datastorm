// @ts-ignore -- Deno environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Import types from separate file
import type {
  Manufacturer,
  Vehicle,
  VehicleSpecification,
  GeminiVehicleResponse,
  VehiclePopulationRequest,
  VehiclePopulationResponse,
  DatabaseInsertResult,
  ManufacturerInsertResult,
  VehicleInsertResult,
  SpecificationInsertResult,
} from './types.ts';

// Zod schema for validating vehicle data from Gemini
const GeminiVehicleResponseSchema = z.object({
  manufacturer: z.object({
    name: z.string().min(1, 'Manufacturer name is required'),
    country: z.string().optional(),
    website: z.string().url().optional(),
  }),
  vehicle: z.object({
    model: z.string().min(1, 'Vehicle model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    trim: z.string().optional(),
    body_style: z.string().optional(),
    is_electric: z.boolean(),
  }),
  specifications: z.object({
    battery_capacity_kwh: z.number().positive().optional(),
    range_miles: z.number().positive().optional(),
    power_hp: z.number().positive().optional(),
    torque_lb_ft: z.number().positive().optional(),
    acceleration_0_60: z.number().positive().optional(),
    top_speed_mph: z.number().positive().optional(),
    weight_lbs: z.number().positive().optional(),
    length_inches: z.number().positive().optional(),
    width_inches: z.number().positive().optional(),
    height_inches: z.number().positive().optional(),
    cargo_capacity_cu_ft: z.number().positive().optional(),
    seating_capacity: z.number().positive().optional(),
  }),
});

// Zod schema for the complete response array
const GeminiVehicleArraySchema = z.array(GeminiVehicleResponseSchema);

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(
  Deno.env.get('GOOGLE_GEMINI_API_KEY') || '',
);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Prompt for electric vehicle data generation
const EV_DATA_PROMPT = `Generate comprehensive data for electric vehicles sold in the United States.

For each vehicle, provide detailed information in this exact JSON format:
[
  {
    "manufacturer": {
      "name": "Manufacturer Name",
      "country": "Country of Origin",
      "website": "Official Website URL"
    },
    "vehicle": {
      "model": "Model Name",
      "year": 2024,
      "trim": "Trim Level (if applicable)",
      "body_style": "SUV, Sedan, Hatchback, etc.",
      "is_electric": true
    },
    "specifications": {
      "battery_capacity_kwh": 75.0,
      "range_miles": 300,
      "power_hp": 350,
      "torque_lb_ft": 400,
      "acceleration_0_60": 4.5,
      "top_speed_mph": 155,
      "weight_lbs": 4500,
      "length_inches": 189.1,
      "width_inches": 74.3,
      "height_inches": 56.8,
      "cargo_capacity_cu_ft": 15.0,
      "seating_capacity": 5
    }
  }
]

Requirements:
- Include 10-15 diverse electric vehicles from different manufacturers
- Focus on popular models available in the US market
- Ensure all numerical values are realistic and accurate
- Include vehicles from Tesla, Ford, Chevrolet, Hyundai, Kia, Volkswagen, BMW, Mercedes, Audi, Rivian, Lucid, etc.
- Cover different body styles: sedans, SUVs, trucks, hatchbacks
- Include both luxury and mainstream vehicles
- All vehicles must be electric (is_electric: true)
- Years should be 2020-2025

Respond with ONLY the JSON array.`;

async function fetchVehicleDataFromGemini(): Promise<GeminiVehicleResponse[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }],
      thinkingConfig: {
        thinkingBudget: 0,
      }
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: EV_DATA_PROMPT }] }]
    });
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Validate the data using Zod schema
    const validatedVehicles = GeminiVehicleArraySchema.parse(parsedData);

    return validatedVehicles;
  } catch (error) {
    console.error('Error fetching vehicle data from Gemini:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';
    throw new Error(`Failed to fetch vehicle data from Gemini: ${errorMessage}`);
  }
}

async function insertOrGetManufacturer(
  manufacturerData: GeminiVehicleResponse['manufacturer']
): Promise<ManufacturerInsertResult> {
  try {
    // Check if manufacturer already exists
    const { data: existingManufacturer, error: searchError } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('name', manufacturerData.name)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      throw searchError;
    }

    if (existingManufacturer) {
      return {
        success: true,
        manufacturer_id: existingManufacturer.id,
      };
    }

    // Create new manufacturer
    const { data: newManufacturer, error: insertError } = await supabase
      .from('manufacturers')
      .insert({
        name: manufacturerData.name,
        country: manufacturerData.country,
        website: manufacturerData.website,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      manufacturer_id: newManufacturer.id,
    };
  } catch (error) {
    console.error('Error handling manufacturer:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';
    return {
      success: false,
      manufacturer_id: '',
      error: errorMessage,
    };
  }
}

async function insertOrGetVehicle(
  vehicleData: GeminiVehicleResponse['vehicle'],
  manufacturerId: string
): Promise<VehicleInsertResult> {
  try {
    // Check if vehicle already exists (same manufacturer, model, year, and trim)
    const { data: existingVehicle, error: searchError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('manufacturer_id', manufacturerId)
      .eq('model', vehicleData.model)
      .eq('year', vehicleData.year)
      .eq('trim', vehicleData.trim || null)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      throw searchError;
    }

    if (existingVehicle) {
      return {
        success: true,
        vehicle_id: existingVehicle.id,
        isExisting: true,
      };
    }

    // Create new vehicle
    const { data: newVehicle, error: insertError } = await supabase
      .from('vehicles')
      .insert({
        manufacturer_id: manufacturerId,
        model: vehicleData.model,
        year: vehicleData.year,
        trim: vehicleData.trim,
        body_style: vehicleData.body_style,
        is_electric: vehicleData.is_electric,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      vehicle_id: newVehicle.id,
      isExisting: false,
    };
  } catch (error) {
    console.error('Error handling vehicle:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';
    return {
      success: false,
      vehicle_id: '',
      error: errorMessage,
    };
  }
}

async function insertVehicleSpecification(
  specData: GeminiVehicleResponse['specifications'],
  vehicleId: string
): Promise<SpecificationInsertResult> {
  try {
    const { data: newSpec, error: insertError } = await supabase
      .from('vehicle_specifications')
      .insert({
        vehicle_id: vehicleId,
        battery_capacity_kwh: specData.battery_capacity_kwh,
        range_miles: specData.range_miles,
        power_hp: specData.power_hp,
        torque_lb_ft: specData.torque_lb_ft,
        acceleration_0_60: specData.acceleration_0_60,
        top_speed_mph: specData.top_speed_mph,
        weight_lbs: specData.weight_lbs,
        length_inches: specData.length_inches,
        width_inches: specData.width_inches,
        height_inches: specData.height_inches,
        cargo_capacity_cu_ft: specData.cargo_capacity_cu_ft,
        seating_capacity: specData.seating_capacity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      specification_id: newSpec.id,
    };
  } catch (error) {
    console.error('Error inserting vehicle specification:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';
    return {
      success: false,
      specification_id: '',
      error: errorMessage,
    };
  }
}

async function populateVehicleDatabase(): Promise<VehiclePopulationResponse> {
  try {
    // Fetch vehicle data from Gemini
    const vehiclesData = await fetchVehicleDataFromGemini();

    if (!vehiclesData || vehiclesData.length === 0) {
      return {
        success: false,
        message: 'No vehicle data was generated',
        error: 'No vehicle data was generated',
        timestamp: new Date().toISOString(),
        source: 'google-gemini',
      };
    }

    let manufacturersCreated = 0;
    let vehiclesCreated = 0;
    let specificationsCreated = 0;
    const createdVehicles: Vehicle[] = [];

    // Process each vehicle
    for (const vehicleData of vehiclesData) {
      try {
        // Handle manufacturer
        const manufacturerResult = await insertOrGetManufacturer(vehicleData.manufacturer);
        if (!manufacturerResult.success) {
          console.error(`Failed to handle manufacturer: ${manufacturerResult.error}`);
          continue;
        }

        if (!manufacturerResult.manufacturer_id) {
          console.error('Manufacturer ID is missing');
          continue;
        }

        // Insert or get existing vehicle
        const vehicleResult = await insertOrGetVehicle(vehicleData.vehicle, manufacturerResult.manufacturer_id);
        if (!vehicleResult.success) {
          console.error(`Failed to insert vehicle: ${vehicleResult.error}`);
          continue;
        }

        if (!vehicleResult.vehicle_id) {
          console.error('Vehicle ID is missing');
          continue;
        }

        // Insert specifications only for new vehicles or update existing ones
        let specResult;
        if (vehicleResult.isExisting) {
          // For existing vehicles, check if we should update specifications
          specResult = { success: true, specification_id: 'existing' };
        } else {
          // For new vehicles, insert specifications
          specResult = await insertVehicleSpecification(vehicleData.specifications, vehicleResult.vehicle_id);
          if (!specResult.success) {
            console.error(`Failed to insert specifications: ${specResult.error}`);
            continue;
          }
        }

        // Count successful insertions
        if (manufacturerResult.success && !vehicleResult.isExisting) {
          manufacturersCreated++;
        }
        if (!vehicleResult.isExisting) {
          vehiclesCreated++;
          specificationsCreated++;
        }

        // Add to created vehicles list
        createdVehicles.push({
          id: vehicleResult.vehicle_id,
          manufacturer_id: manufacturerResult.manufacturer_id,
          model: vehicleData.vehicle.model,
          year: vehicleData.vehicle.year,
          trim: vehicleData.vehicle.trim,
          body_style: vehicleData.vehicle.body_style,
          is_electric: vehicleData.vehicle.is_electric,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      } catch (error) {
        console.error(`Error processing vehicle ${vehicleData.vehicle.model}:`, error);
        continue;
      }
    }

    if (vehiclesCreated === 0) {
      return {
        success: false,
        message: 'Failed to create any vehicles',
        error: 'Failed to create any vehicles',
        timestamp: new Date().toISOString(),
        source: 'google-gemini',
      };
    }

    const totalProcessed = vehiclesData.length;
    const duplicatesSkipped = totalProcessed - vehiclesCreated;
    
    return {
      success: true,
      message: `Successfully processed ${totalProcessed} vehicles. Created ${vehiclesCreated} new vehicles, skipped ${duplicatesSkipped} duplicates.`,
      data: {
        manufacturers_created: manufacturersCreated,
        vehicles_created: vehiclesCreated,
        specifications_created: specificationsCreated,
        total_processed: totalProcessed,
        duplicates_skipped: duplicatesSkipped,
        vehicles: createdVehicles,
      },
      timestamp: new Date().toISOString(),
      source: 'google-gemini',
    };

  } catch (error) {
    console.error('Error in vehicle database population:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';

    return {
      success: false,
      message: 'Failed to populate vehicle database',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      source: 'google-gemini',
    };
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed. Use POST.',
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }

  try {
    // Parse request body
    let requestBody: VehiclePopulationRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    // Process the request
    const response = await populateVehicleDatabase();

    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        source: 'google-gemini',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});
