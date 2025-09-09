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

// Gemini Proxy API function
async function callGeminiProxy(request: {
  task: string;
  prompt: string;
  data?: Record<string, any>;
  expectedOutput?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string; usage?: any }> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured');
    }

    const geminiProxyUrl = `${supabaseUrl}/functions/v1/gemini-proxy`;
    
    const response = await fetch(geminiProxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini Proxy API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Gemini Proxy error: ${data.error}`);
    }

    return {
      text: data.data.text,
      usage: data.data.usage,
    };
  } catch (error) {
    console.error('Error calling Gemini Proxy API:', error);
    throw new Error(`Gemini Proxy API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

// Process search results to extract structured vehicle data using Gemini
async function processSearchResultsForVehicleData(
  vehicleSearchResults: GoogleSearchResponse[],
  newsSearchResults: GoogleSearchResponse[],
  params: VehicleUpdateParams,
  targetYear: number
): Promise<VehicleData> {
  console.log('📊 Processing search results for vehicle data using Gemini...');

  // Combine all search results into a single text for analysis
  const allSearchResults = [
    ...vehicleSearchResults.flatMap(response => response.items || []),
    ...newsSearchResults.flatMap(response => response.items || [])
  ];

  // Limit search results and truncate long snippets to stay within prompt limits
  const maxResults = 20; // Limit to 20 most relevant results
  const maxSnippetLength = 200; // Truncate snippets to 200 characters
  
  const limitedSearchResults = allSearchResults.slice(0, maxResults);
  
  const searchResultsText = limitedSearchResults
    .map(item => {
      const truncatedSnippet = item.snippet && item.snippet.length > maxSnippetLength 
        ? item.snippet.substring(0, maxSnippetLength) + '...'
        : item.snippet;
      return `Title: ${item.title}\nSnippet: ${truncatedSnippet}\nURL: ${item.link}\n---`;
    })
    .join('\n');

  // Use Gemini to extract manufacturer information
  const manufacturerData = await extractManufacturerData(params, searchResultsText);
  
  // Use Gemini to extract vehicle information
  const vehicleData = await extractVehicleData(params, targetYear, searchResultsText);
  
  // Use Gemini to extract specifications
  const specificationsData = await extractSpecificationsData(params, targetYear, searchResultsText);
  
  // Use Gemini to extract and categorize news articles
  const newsArticlesData = await extractNewsArticlesData(params, newsSearchResults);

  return {
    manufacturer: manufacturerData,
    vehicles: vehicleData,
    specifications: specificationsData,
    newsArticles: newsArticlesData
  };
}

// Helper function to truncate prompt if it exceeds limits
function truncatePromptIfNeeded(prompt: string, maxLength: number = 9000): string {
  if (prompt.length <= maxLength) {
    return prompt;
  }
  
  // Find the search results section and truncate it
  const searchResultsIndex = prompt.indexOf('Search Results:');
  if (searchResultsIndex === -1) {
    return prompt.substring(0, maxLength);
  }
  
  const beforeSearchResults = prompt.substring(0, searchResultsIndex + 'Search Results:'.length);
  const remainingLength = maxLength - beforeSearchResults.length - 100; // Leave room for closing text
  
  const searchResultsSection = prompt.substring(searchResultsIndex + 'Search Results:'.length);
  const truncatedSearchResults = searchResultsSection.substring(0, remainingLength) + '\n\n[Search results truncated for length]';
  
  return beforeSearchResults + '\n' + truncatedSearchResults + prompt.substring(prompt.lastIndexOf('If information is not available'));
}

// Extract manufacturer data using Gemini
async function extractManufacturerData(params: VehicleUpdateParams, searchResultsText: string) {
  let prompt = `Analyze the following search results and extract manufacturer information for ${params.manufacturer}.

Search Results:
${searchResultsText}

Please extract and return ONLY a JSON object with the following structure:
{
  "name": "${params.manufacturer}",
  "country": "Country where the manufacturer is headquartered",
  "website": "Official website URL"
}

If information is not available in the search results, use your knowledge to provide reasonable defaults.`;

  // Ensure prompt doesn't exceed limits
  prompt = truncatePromptIfNeeded(prompt);

  const response = await callGeminiProxy({
    task: 'analyze_vehicle_data',
    prompt,
    expectedOutput: 'JSON object with manufacturer information',
    temperature: 0.3
  });

  try {
    const data = JSON.parse(response.text);
    return {
      name: data.name || params.manufacturer,
      country: data.country || 'Unknown',
      website: data.website || ''
    };
  } catch (error) {
    console.warn('Failed to parse manufacturer data from Gemini, using fallback');
    return await getFallbackManufacturerData(params);
  }
}

// Extract vehicle data using Gemini
async function extractVehicleData(params: VehicleUpdateParams, targetYear: number, searchResultsText: string) {
  let prompt = `Analyze the following search results and extract vehicle information for ${params.manufacturer} ${params.model} ${targetYear}.

Search Results:
${searchResultsText}

Please extract and return ONLY a JSON array with vehicle objects. Each vehicle should have the following structure:
{
  "model": "Model name",
  "year": ${targetYear},
  "model_year": ${targetYear},
  "trim": "Trim level (e.g., Base, Performance, Long Range)",
  "body_style": "Body style (Sedan, SUV, Truck, etc.)",
  "is_electric": true/false,
  "is_currently_available": true/false
}

If multiple trims are mentioned, create separate objects for each. If information is not available, use reasonable defaults based on the model name.`;

  // Ensure prompt doesn't exceed limits
  prompt = truncatePromptIfNeeded(prompt);

  const response = await callGeminiProxy({
    task: 'analyze_vehicle_data',
    prompt,
    expectedOutput: 'JSON array of vehicle objects',
    temperature: 0.3
  });

  try {
    const data = JSON.parse(response.text);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.warn('Failed to parse vehicle data from Gemini, using fallback');
    const fallbackData = await getFallbackVehicleData(params, targetYear);
    return [fallbackData];
  }
}

// Extract specifications data using Gemini
async function extractSpecificationsData(params: VehicleUpdateParams, targetYear: number, searchResultsText: string) {
  let prompt = `Analyze the following search results and extract detailed specifications for ${params.manufacturer} ${params.model} ${targetYear}.

Search Results:
${searchResultsText}

Please extract and return ONLY a JSON object with the following structure:
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
  "charging_speed_kw": number
}

Extract actual values from the search results. If a specification is not mentioned, omit it from the JSON object (don't include null values). Use your knowledge to provide reasonable estimates if specific data is not available.`;

  // Ensure prompt doesn't exceed limits
  prompt = truncatePromptIfNeeded(prompt);

  const response = await callGeminiProxy({
    task: 'analyze_vehicle_data',
    prompt,
    expectedOutput: 'JSON object with vehicle specifications',
    temperature: 0.3
  });

  try {
    const data = JSON.parse(response.text);
    // Filter out null/undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== null && value !== undefined)
    );
    return [filteredData];
  } catch (error) {
    console.warn('Failed to parse specifications data from Gemini, using fallback');
    const fallbackData = await getFallbackSpecificationsData(params, targetYear);
    return [fallbackData];
  }
}

// Extract news articles data using Gemini
async function extractNewsArticlesData(params: VehicleUpdateParams, newsSearchResults: GoogleSearchResponse[]) {
  const newsItems = newsSearchResults.flatMap(response => response.items || []);
  
  if (newsItems.length === 0) {
    return [];
  }

  const newsText = newsItems
    .map(item => `Title: ${item.title}\nSnippet: ${item.snippet}\nURL: ${item.link}\nSource: ${item.displayLink}\n---`)
    .join('\n');

  const prompt = `Analyze the following news articles about ${params.manufacturer} ${params.model} and extract structured information.

News Articles:
${newsText}

Please extract and return ONLY a JSON array with article objects. Each article should have the following structure:
{
  "title": "Article title",
  "summary": "Brief summary of the article",
  "source_url": "Article URL",
  "source_name": "Source website name",
  "category": "Category (Reviews, Market Trends, Technology, Performance, Safety, General)",
  "tags": ["array", "of", "relevant", "tags"],
  "published_date": "YYYY-MM-DD format"
}

Categorize each article appropriately and extract relevant tags. If published date is not available, use today's date. Limit to the 10 most relevant articles.`;

  const response = await callGeminiProxy({
    task: 'analyze_vehicle_data',
    prompt,
    expectedOutput: 'JSON array of news article objects',
    temperature: 0.3
  });

  try {
    const data = JSON.parse(response.text);
    return Array.isArray(data) ? data.slice(0, 10) : [data];
  } catch (error) {
    console.warn('Failed to parse news articles data from Gemini, using fallback');
    const fallbackArticles: any[] = [];
    for (const item of newsItems.slice(0, 10)) {
      const fallbackData = await getFallbackNewsArticleData(item, params);
      fallbackArticles.push(fallbackData);
    }
    return fallbackArticles;
  }
}

// Fallback functions using Gemini for data extraction when primary extraction fails
async function getFallbackManufacturerData(params: VehicleUpdateParams) {
  const prompt = `Provide basic manufacturer information for ${params.manufacturer}. Return ONLY a JSON object:
{
  "name": "${params.manufacturer}",
  "country": "Country where headquartered",
  "website": "Official website URL"
}`;

  try {
    const response = await callGeminiProxy({
      task: 'analyze_vehicle_data',
      prompt,
      expectedOutput: 'JSON object with manufacturer information',
      temperature: 0.1
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.warn('Fallback manufacturer data extraction failed, using minimal defaults');
    return {
      name: params.manufacturer,
      country: 'Unknown',
      website: ''
    };
  }
}

async function getFallbackVehicleData(params: VehicleUpdateParams, targetYear: number) {
  const prompt = `Provide basic vehicle information for ${params.manufacturer} ${params.model} ${targetYear}. Return ONLY a JSON object:
{
  "model": "${params.model}",
  "year": ${targetYear},
  "model_year": ${targetYear},
  "trim": "${params.trim || 'Base'}",
  "body_style": "Body style (Sedan, SUV, Truck, etc.)",
  "is_electric": true/false,
  "is_currently_available": true
}`;

  try {
    const response = await callGeminiProxy({
      task: 'analyze_vehicle_data',
      prompt,
      expectedOutput: 'JSON object with vehicle information',
      temperature: 0.1
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.warn('Fallback vehicle data extraction failed, using minimal defaults');
    return {
      model: params.model,
      year: targetYear,
      model_year: targetYear,
      trim: params.trim || 'Base',
      body_style: 'Sedan',
      is_electric: true,
      is_currently_available: true
    };
  }
}

async function getFallbackSpecificationsData(params: VehicleUpdateParams, targetYear: number) {
  const prompt = `Provide basic specifications for ${params.manufacturer} ${params.model} ${targetYear}. Return ONLY a JSON object with any known specifications (omit fields you don't know):
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
  "seating_capacity": number
}`;

  try {
    const response = await callGeminiProxy({
      task: 'analyze_vehicle_data',
      prompt,
      expectedOutput: 'JSON object with vehicle specifications',
      temperature: 0.1
    });
    
    const data = JSON.parse(response.text);
    // Filter out null/undefined values
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== null && value !== undefined)
    );
  } catch (error) {
    console.warn('Fallback specifications data extraction failed, returning empty object');
    return {};
  }
}

async function getFallbackNewsArticleData(article: any, params: VehicleUpdateParams) {
  const prompt = `Categorize and tag this news article about ${params.manufacturer} ${params.model}:

Title: ${article.title}
Summary: ${article.snippet}

Return ONLY a JSON object:
{
  "title": "${article.title}",
  "summary": "${article.snippet}",
  "source_url": "${article.link}",
  "source_name": "${article.displayLink}",
  "category": "Category (Reviews, Market Trends, Technology, Performance, Safety, General)",
  "tags": ["array", "of", "relevant", "tags"],
  "published_date": "${new Date().toISOString().split('T')[0]}"
}`;

  try {
    const response = await callGeminiProxy({
      task: 'analyze_vehicle_data',
      prompt,
      expectedOutput: 'JSON object with categorized article data',
      temperature: 0.1
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.warn('Fallback news article categorization failed, using basic defaults');
    return {
      title: article.title,
      summary: article.snippet,
      source_url: article.link,
      source_name: article.displayLink,
      category: 'General',
      tags: [params.manufacturer, params.model],
      published_date: new Date().toISOString().split('T')[0]
    };
  }
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
