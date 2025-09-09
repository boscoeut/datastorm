import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types for EV search functionality
export interface ExtractedVehicle {
  manufacturer: string;
  model: string;
  trim?: string;
  year?: number;
  source: string;
  url: string;
}

export interface EVSearchParams {
  manufacturer: string;
  model?: string;
  trim?: string;
  year?: number;
  includeAllTrims?: boolean;
  maxResults?: number;
}

export interface EVSearchResult {
  success: boolean;
  message: string;
  foundVehicles: ExtractedVehicle[];
  missingVehicles: ExtractedVehicle[];
  totalSearched: number;
  manufacturer: string;
  model: string;
  trim?: string;
  year?: number;
  includeAllTrims?: boolean;
  timestamp: string;
  source: string;
}

// Call Gemini API using the official Google Generative AI library
async function callGeminiAPI(prompt: string): Promise<any> {
  try {
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return in the same format as the direct API call for compatibility
    return {
      candidates: [{
        content: {
          parts: [{
            text: text
          }]
        }
      }]
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Research vehicles using Gemini AI without web search
async function researchVehiclesWithGemini(
  manufacturer: string,
  model: string,
  trim: string,
  year: number,
  includeAllTrims: boolean,
  maxResults: number
): Promise<ExtractedVehicle[]> {
  try {
    // Create comprehensive Gemini prompt for vehicle research
    const targetVehicle = model ? `${manufacturer} ${model}${trim ? ` ${trim}` : ''} ${year}` : `${manufacturer} electric vehicles ${year}`;
    const searchScope = model ? 'specific model' : 'all models from the manufacturer';
    
    const prompt = `You are an expert automotive researcher specializing in electric vehicles. Research and compile a comprehensive list of electric vehicles for the specified manufacturer${model ? ` and model` : ''}.

Target: ${targetVehicle}

Please research and provide information about:

1. **Primary Focus**: ${model ? `${manufacturer} ${model}${trim ? ` ${trim}` : ''} ${year}` : `All electric vehicles from ${manufacturer} in ${year}`}
2. **All Available Trims**: ${includeAllTrims ? 'Include all available trim levels and variants' : 'Focus on the specified trim only'}
3. **Model Years**: Include current and recent model years (2020-2025)
4. **${model ? 'Related Models' : 'All Models'}**: ${model ? 'Include any related electric vehicles from the same manufacturer' : 'Include all electric vehicle models from this manufacturer'}

For each vehicle, provide:
- Manufacturer (standardized name)
- Model (exact model name)
- Trim level (specific trim/variant)
- Year (model year)
- Source (where this information is commonly found)
- URL (official manufacturer page or reliable automotive source)

Focus on:
- Electric vehicles only (BEVs, PHEVs, EVs)
- Current and recent model years (2020-2025)
- Official trim levels and variants
- Reliable automotive sources

Return the results as a JSON array with this exact format:
[
  {
    "manufacturer": "Tesla",
    "model": "Model 3",
    "trim": "Long Range",
    "year": 2024,
    "source": "Tesla Official",
    "url": "https://www.tesla.com/model3"
  },
  {
    "manufacturer": "Tesla",
    "model": "Model 3",
    "trim": "Performance",
    "year": 2024,
    "source": "Tesla Official",
    "url": "https://www.tesla.com/model3"
  }
]

Limit results to ${maxResults} vehicles maximum. If no vehicles are found, return an empty array [].`;

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt);
    
    if (!geminiResponse || !geminiResponse.candidates || !geminiResponse.candidates[0]) {
      console.error('Invalid Gemini response:', geminiResponse);
      return [];
    }

    const responseText = geminiResponse.candidates[0].content.parts[0].text;
    console.log('Gemini research response:', responseText);

    // Parse JSON response
    let vehicles: ExtractedVehicle[] = [];
    try {
      // Extract JSON from response (handle cases where Gemini adds extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonText = jsonMatch[0];
        const parsedVehicles = JSON.parse(jsonText);
        
        // Convert to our format
        vehicles = parsedVehicles
          .map((v: any) => ({
            manufacturer: v.manufacturer?.toLowerCase() || '',
            model: v.model || '',
            trim: v.trim || '',
            year: v.year || undefined,
            source: v.source || 'Gemini Research',
            url: v.url || ''
          }))
          .filter((v: ExtractedVehicle) => v.manufacturer && v.model)
          .slice(0, maxResults); // Limit to maxResults
      }
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      console.error('Response text:', responseText);
    }

    console.log(`Gemini researched ${vehicles.length} vehicles`);
    return vehicles;

  } catch (error) {
    console.error('Error in researchVehiclesWithGemini:', error);
    return [];
  }
}

// Get existing vehicles from database
async function getExistingVehiclesFromDatabase(): Promise<ExtractedVehicle[]> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        model,
        manufacturers!inner(name)
      `);

    if (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }

    return vehicles.map((v: any) => ({
      manufacturer: (v.manufacturers as any).name.toLowerCase(),
      model: v.model.toLowerCase(),
      trim: '',
      year: undefined,
      source: 'Database',
      url: ''
    }));
  } catch (error) {
    console.error('Error in getExistingVehiclesFromDatabase:', error);
    return [];
  }
}

// Find missing vehicles by comparing found vehicles with existing ones
function findMissingVehicles(foundVehicles: ExtractedVehicle[], existingVehicles: ExtractedVehicle[]): ExtractedVehicle[] {
  return foundVehicles.filter(found => {
    return !existingVehicles.some(existing => 
      existing.manufacturer === found.manufacturer && 
      existing.model === found.model
    );
  });
}

// Execute search-evs functionality
export async function executeSearchEVs(args: any, requestId: any): Promise<any> {
  console.log('MCP Server: Executing search-evs with args:', args)
  
  try {
    // Validate required parameters
    if (!args.manufacturer) {
      throw new Error('Manufacturer is a required parameter');
    }

    // Set default parameters
    const manufacturer = args.manufacturer.trim();
    const model = args.model?.trim() || '';
    const trim = args.trim?.trim() || '';
    const year = args.year || new Date().getFullYear();
    const includeAllTrims = args.includeAllTrims !== false; // Default to true
    const maxResults = Math.min(args.maxResults || 20, 50);

    console.log(`Researching ${manufacturer} ${model} using Gemini AI...`);

    // Use Gemini AI to research and compile vehicle information
    const foundVehicles = await researchVehiclesWithGemini(manufacturer, model, trim, year, includeAllTrims, maxResults);
    console.log('Researched vehicles with Gemini:', foundVehicles.length);

    // Get existing vehicles from database
    const existingVehicles = await getExistingVehiclesFromDatabase();
    console.log('Existing vehicles in database:', existingVehicles.length);

    // Compare and find missing vehicles
    const missingVehicles = findMissingVehicles(foundVehicles, existingVehicles);
    console.log('Missing vehicles found:', missingVehicles.length);

    const response: EVSearchResult = {
      success: true,
      message: `Researched ${foundVehicles.length} vehicles for ${manufacturer} ${model}, ${missingVehicles.length} are missing from database`,
      foundVehicles: foundVehicles,
      missingVehicles: missingVehicles,
      totalSearched: foundVehicles.length,
      manufacturer: manufacturer,
      model: model,
      trim: trim,
      year: year,
      includeAllTrims: includeAllTrims,
      timestamp: new Date().toISOString(),
      source: 'datastorm-mcp-server'
    };

    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
        isError: false,
      },
    };
  } catch (error) {
    console.error('Error in search-evs execution:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: 'Internal error',
        data: `search-evs execution failed: ${errorMessage}`,
      },
    };
  }
}
