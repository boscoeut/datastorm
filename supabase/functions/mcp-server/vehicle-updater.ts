import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  }>
  newsArticles: Array<{
    title: string
    summary: string
    source_url: string
    source_name: string
    category: string
    tags: string[]
    published_date: string
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
    news_articles_added: number
    news_articles_skipped: number
    trims_processed: string[]
    vehicle_ids: string[]
    model_year_processed: string
  }
  timestamp: string
  source: string
  error?: string
}

// Google Search API types (reused from main file)
interface GoogleSearchParams {
  query: string;
  num_results?: number;
  site_restriction?: string;
  language?: string;
  start_index?: number;
}

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
}

interface GoogleSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: GoogleSearchResult[];
}

// Google Search API function
async function callGoogleSearchAPI(params: GoogleSearchParams): Promise<GoogleSearchResponse> {
  try {
    const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (!apiKey || !searchEngineId) {
      throw new Error('Google Search API key or search engine ID not configured');
    }

    // Build search URL
    const baseUrl = 'https://www.googleapis.com/customsearch/v1';
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: params.query,
      num: String(params.num_results || 10),
      start: String(params.start_index || 1),
    });

    // Add optional parameters
    if (params.site_restriction) {
      searchParams.append('siteSearch', params.site_restriction);
    }
    if (params.language) {
      searchParams.append('lr', `lang_${params.language}`);
    }

    const url = `${baseUrl}?${searchParams.toString()}`;

    // Make the API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Search API error: ${response.status} ${errorText}`);
    }

    const data: GoogleSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Google Search API:', error);
    throw new Error(`Google Search API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    news_articles_added: 0,
    news_articles_skipped: 0,
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

    // Step 4: Process news articles
    console.log('📰 Processing news articles...');
    for (const article of vehicleData.newsArticles) {
      const articleResult = await processNewsArticle(article, supabase);
      counters.news_articles_added += articleResult.added;
      counters.news_articles_skipped += articleResult.skipped;
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

// Research vehicle information using Google Search
async function researchVehicleInformation(params: VehicleUpdateParams): Promise<VehicleData> {
  console.log('🔍 Researching vehicle information for:', params);
  
  // Determine the most recent model year (prioritize current year or next year)
  const currentYear = new Date().getFullYear();
  const targetYear = params.year || currentYear;
  
  // Search for vehicle information
  const vehicleSearchQueries = [
    `${params.manufacturer} ${params.model} ${targetYear} specifications`,
    `${params.manufacturer} ${params.model} ${targetYear} trims`,
    `${params.manufacturer} ${params.model} ${targetYear} price MSRP`,
    `${params.manufacturer} ${params.model} ${targetYear} battery range`,
    `${params.manufacturer} ${params.model} ${targetYear} performance`
  ];

  // Search for news articles
  const newsSearchQueries = [
    `${params.manufacturer} ${params.model} ${targetYear} news`,
    `${params.manufacturer} ${params.model} ${targetYear} review`,
    `${params.manufacturer} ${params.model} ${targetYear} update`,
    `${params.manufacturer} ${params.model} ${targetYear} price change`
  ];

  // Execute searches
  const vehicleSearchResults = await Promise.all(
    vehicleSearchQueries.map(query => callGoogleSearchAPI({ query, num_results: 5 }))
  );

  const newsSearchResults = await Promise.all(
    newsSearchQueries.map(query => callGoogleSearchAPI({ query, num_results: 3 }))
  );

  // Process search results to extract vehicle data
  const vehicleData = await processSearchResultsForVehicleData(
    vehicleSearchResults,
    newsSearchResults,
    params,
    targetYear
  );

  return vehicleData;
}

// Process search results to extract structured vehicle data
async function processSearchResultsForVehicleData(
  vehicleSearchResults: GoogleSearchResponse[],
  newsSearchResults: GoogleSearchResponse[],
  params: VehicleUpdateParams,
  targetYear: number
): Promise<VehicleData> {
  console.log('📊 Processing search results for vehicle data...');

  // Extract manufacturer information
  const manufacturer = {
    name: params.manufacturer,
    country: getCountryFromManufacturer(params.manufacturer),
    website: getWebsiteFromManufacturer(params.manufacturer)
  };

  // Extract vehicle information (simplified for demo - in production, you'd parse the actual content)
  const vehicles = [{
    model: params.model,
    year: targetYear,
    model_year: targetYear,
    trim: params.trim || 'Base',
    body_style: getBodyStyleFromModel(params.model),
    is_electric: true, // Assuming electric vehicles for this system
    is_currently_available: true
  }];

  // Extract specifications (simplified - in production, parse actual content from search results)
  const specifications = [{
    battery_capacity_kwh: getBatteryCapacityFromModel(params.model, targetYear),
    range_miles: getRangeFromModel(params.model, targetYear),
    power_hp: getPowerFromModel(params.model, targetYear),
    torque_lb_ft: getTorqueFromModel(params.model, targetYear),
    acceleration_0_60: getAccelerationFromModel(params.model, targetYear),
    top_speed_mph: getTopSpeedFromModel(params.model, targetYear),
    weight_lbs: getWeightFromModel(params.model, targetYear),
    length_inches: getLengthFromModel(params.model, targetYear),
    width_inches: getWidthFromModel(params.model, targetYear),
    height_inches: getHeightFromModel(params.model, targetYear),
    cargo_capacity_cu_ft: getCargoCapacityFromModel(params.model, targetYear),
    seating_capacity: getSeatingCapacityFromModel(params.model, targetYear)
  }];

  // Extract news articles
  const newsArticles = newsSearchResults.flatMap(response => 
    (response.items || []).map(item => ({
      title: item.title,
      summary: item.snippet,
      source_url: item.link,
      source_name: item.displayLink,
      category: categorizeNewsArticle(item.title, item.snippet),
      tags: extractTagsFromArticle(item.title, item.snippet, params),
      published_date: new Date().toISOString().split('T')[0] // Simplified - in production, extract actual date
    }))
  ).slice(0, 10); // Limit to 10 articles

  return {
    manufacturer,
    vehicles,
    specifications,
    newsArticles
  };
}

// Helper functions for data extraction (simplified for demo)
function getCountryFromManufacturer(manufacturer: string): string {
  const countryMap: Record<string, string> = {
    'Tesla': 'USA',
    'Ford': 'USA',
    'GM': 'USA',
    'BMW': 'Germany',
    'Mercedes': 'Germany',
    'Audi': 'Germany',
    'Volkswagen': 'Germany',
    'Toyota': 'Japan',
    'Honda': 'Japan',
    'Nissan': 'Japan',
    'Hyundai': 'South Korea',
    'Kia': 'South Korea'
  };
  return countryMap[manufacturer] || 'Unknown';
}

function getWebsiteFromManufacturer(manufacturer: string): string {
  const websiteMap: Record<string, string> = {
    'Tesla': 'https://tesla.com',
    'Ford': 'https://ford.com',
    'GM': 'https://gm.com',
    'BMW': 'https://bmw.com',
    'Mercedes': 'https://mercedes-benz.com',
    'Audi': 'https://audi.com',
    'Volkswagen': 'https://volkswagen.com',
    'Toyota': 'https://toyota.com',
    'Honda': 'https://honda.com',
    'Nissan': 'https://nissan.com',
    'Hyundai': 'https://hyundai.com',
    'Kia': 'https://kia.com'
  };
  return websiteMap[manufacturer] || '';
}

function getBodyStyleFromModel(model: string): string {
  const modelLower = model.toLowerCase();
  if (modelLower.includes('suv') || modelLower.includes('x')) return 'SUV';
  if (modelLower.includes('truck') || modelLower.includes('cybertruck')) return 'Truck';
  if (modelLower.includes('roadster')) return 'Roadster';
  return 'Sedan';
}

// Simplified specification extraction functions (in production, these would parse actual content)
function getBatteryCapacityFromModel(model: string, year: number): number {
  // Simplified logic - in production, parse from search results
  if (model.toLowerCase().includes('model s')) return 100;
  if (model.toLowerCase().includes('model x')) return 100;
  if (model.toLowerCase().includes('model 3')) return 75;
  if (model.toLowerCase().includes('model y')) return 75;
  if (model.toLowerCase().includes('cybertruck')) return 200;
  return 75; // Default
}

function getRangeFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 405;
  if (model.toLowerCase().includes('model x')) return 348;
  if (model.toLowerCase().includes('model 3')) return 272;
  if (model.toLowerCase().includes('model y')) return 330;
  if (model.toLowerCase().includes('cybertruck')) return 500;
  return 300; // Default
}

function getPowerFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 1020;
  if (model.toLowerCase().includes('model x')) return 1020;
  if (model.toLowerCase().includes('model 3')) return 450;
  if (model.toLowerCase().includes('model y')) return 456;
  if (model.toLowerCase().includes('cybertruck')) return 845;
  return 400; // Default
}

function getTorqueFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 1050;
  if (model.toLowerCase().includes('model x')) return 1050;
  if (model.toLowerCase().includes('model 3')) return 471;
  if (model.toLowerCase().includes('model y')) return 497;
  if (model.toLowerCase().includes('cybertruck')) return 1050;
  return 500; // Default
}

function getAccelerationFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 1.99;
  if (model.toLowerCase().includes('model x')) return 2.5;
  if (model.toLowerCase().includes('model 3')) return 3.1;
  if (model.toLowerCase().includes('model y')) return 3.5;
  if (model.toLowerCase().includes('cybertruck')) return 2.6;
  return 4.0; // Default
}

function getTopSpeedFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 200;
  if (model.toLowerCase().includes('model x')) return 163;
  if (model.toLowerCase().includes('model 3')) return 162;
  if (model.toLowerCase().includes('model y')) return 155;
  if (model.toLowerCase().includes('cybertruck')) return 130;
  return 150; // Default
}

function getWeightFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 4561;
  if (model.toLowerCase().includes('model x')) return 5185;
  if (model.toLowerCase().includes('model 3')) return 3549;
  if (model.toLowerCase().includes('model y')) return 4416;
  if (model.toLowerCase().includes('cybertruck')) return 6600;
  return 4000; // Default
}

function getLengthFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 196;
  if (model.toLowerCase().includes('model x')) return 198;
  if (model.toLowerCase().includes('model 3')) return 185;
  if (model.toLowerCase().includes('model y')) return 187;
  if (model.toLowerCase().includes('cybertruck')) return 223;
  return 190; // Default
}

function getWidthFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 77;
  if (model.toLowerCase().includes('model x')) return 79;
  if (model.toLowerCase().includes('model 3')) return 73;
  if (model.toLowerCase().includes('model y')) return 76;
  if (model.toLowerCase().includes('cybertruck')) return 80;
  return 75; // Default
}

function getHeightFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 57;
  if (model.toLowerCase().includes('model x')) return 66;
  if (model.toLowerCase().includes('model 3')) return 57;
  if (model.toLowerCase().includes('model y')) return 64;
  if (model.toLowerCase().includes('cybertruck')) return 70;
  return 60; // Default
}

function getCargoCapacityFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 28;
  if (model.toLowerCase().includes('model x')) return 88;
  if (model.toLowerCase().includes('model 3')) return 15;
  if (model.toLowerCase().includes('model y')) return 76;
  if (model.toLowerCase().includes('cybertruck')) return 100;
  return 20; // Default
}

function getSeatingCapacityFromModel(model: string, year: number): number {
  if (model.toLowerCase().includes('model s')) return 5;
  if (model.toLowerCase().includes('model x')) return 7;
  if (model.toLowerCase().includes('model 3')) return 5;
  if (model.toLowerCase().includes('model y')) return 7;
  if (model.toLowerCase().includes('cybertruck')) return 6;
  return 5; // Default
}

function categorizeNewsArticle(title: string, snippet: string): string {
  const text = (title + ' ' + snippet).toLowerCase();
  if (text.includes('review') || text.includes('test')) return 'Reviews';
  if (text.includes('price') || text.includes('cost')) return 'Market Trends';
  if (text.includes('technology') || text.includes('feature')) return 'Technology';
  if (text.includes('performance') || text.includes('speed')) return 'Performance';
  if (text.includes('safety') || text.includes('crash')) return 'Safety';
  if (text.includes('recall') || text.includes('issue')) return 'Safety';
  return 'General';
}

function extractTagsFromArticle(title: string, snippet: string, params: VehicleUpdateParams): string[] {
  const tags = [params.manufacturer, params.model];
  const text = (title + ' ' + snippet).toLowerCase();
  
  if (text.includes('electric') || text.includes('ev')) tags.push('electric');
  if (text.includes('autonomous') || text.includes('self-driving')) tags.push('autonomous');
  if (text.includes('battery')) tags.push('battery');
  if (text.includes('charging')) tags.push('charging');
  if (text.includes('performance')) tags.push('performance');
  if (text.includes('safety')) tags.push('safety');
  
  return tags;
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

async function processNewsArticle(article: any, supabase: any) {
  console.log('📰 Processing news article:', article.title);
  
  // Check if article exists
  const { data: existingArticle, error: checkError } = await supabase
    .from('news_articles')
    .select('*')
    .eq('source_url', article.source_url)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Error checking news article: ${checkError.message}`);
  }

  if (existingArticle) {
    console.log('⏭️ News article already exists, skipping:', article.title);
    return { added: 0, skipped: 1 };
  } else {
    // Create new article
    const { error: createError } = await supabase
      .from('news_articles')
      .insert([{
        title: article.title,
        summary: article.summary,
        source_url: article.source_url,
        source_name: article.source_name,
        category: article.category,
        tags: article.tags,
        published_date: article.published_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (createError) {
      throw new Error(`Error creating news article: ${createError.message}`);
    }

    console.log('✅ News article created:', article.title);
    return { added: 1, skipped: 0 };
  }
}
