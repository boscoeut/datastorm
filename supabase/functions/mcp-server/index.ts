import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Create service role client for admin checks
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// MCP Tool Definitions
interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
}

// Define available MCP tools
const mcpTools: MCPTool[] = [
  {
    name: 'populate-images',
    description: 'Populate vehicle image galleries by searching for and downloading images from Google Search. Requires admin privileges.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: {
          type: 'string',
          description: 'Vehicle ID to populate images for'
        },
        model: {
          type: 'string',
          description: 'Vehicle model name'
        },
        trim: {
          type: 'string',
          description: 'Vehicle trim level (optional)'
        },
        manufacturer: {
          type: 'string',
          description: 'Vehicle manufacturer (optional)'
        },
        maxImages: {
          type: 'number',
          description: 'Maximum number of images to download (default: 8)',
          minimum: 1,
          maximum: 20
        }
      },
      required: ['vehicleId', 'model']
    }
  }
]

// Check if user is admin
async function checkAdminPermission(userId: string): Promise<boolean> {
  try {
    console.log('Calling is_admin RPC with user_id:', userId)
    const { data, error } = await supabaseAdmin.rpc('is_admin', { user_uuid: userId })
    console.log('is_admin RPC result:', { data, error })
    if (error) {
      console.error('Error checking admin permission:', error)
      return false
    }
    return data === true
  } catch (error) {
    console.error('Error in checkAdminPermission:', error)
    return false
  }
}

// MCP Server initialization
function handleInitialize(request: any): any {
  console.log('MCP Server: Handling initialize request')
  
  return {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false
        }
      },
      serverInfo: {
        name: 'datastorm-mcp-server',
        version: '1.0.0',
        description: 'MCP Server for Electric Vehicle Data Hub with populate-images functionality'
      }
    }
  }
}

// List available tools
function handleToolsList(request: any): any {
  console.log('MCP Server: Handling tools/list request')
  
  return {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      tools: mcpTools
    }
  }
}

// Execute a tool
async function handleToolsCall(request: any, token: string, isServiceToken: boolean = false): Promise<any> {
  console.log('MCP Server: Handling tools/call request for:', request.params.name)
  
  const { name, arguments: args } = request.params
  
  if (name === 'populate-images') {
    return await executePopulateImages(args, token, request.id, isServiceToken)
  }
  
  // Tool not found
  return {
    jsonrpc: '2.0',
    id: request.id,
    error: {
      code: -32601,
      message: 'Method not found',
      data: `Tool '${name}' is not available`
    }
  }
}

// Execute populate-images functionality
async function executePopulateImages(args: any, token: string, requestId: any, isServiceToken: boolean = false): Promise<any> {
  console.log('MCP Server: Executing populate-images with args:', args)
  
  try {
    let userId: string | null = null
    let isAdmin = false

    if (isServiceToken) {
      // For service tokens, we'll allow admin operations
      // This is a development convenience - in production you'd want stricter controls
      console.log('Service token detected, allowing admin operations')
      userId = 'service-admin' // Placeholder for service operations
      isAdmin = true
    } else {
      // Try to verify as user token
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (authError || !user) {
        return {
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32000,
            message: 'Authentication failed',
            data: 'Invalid or expired token'
          }
        }
      }

      console.log('User authenticated:', user.id)
      userId = user.id
      
      // Check admin permission for user tokens
      isAdmin = await checkAdminPermission(user.id)
    }
    
    if (!isAdmin) {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32000,
          message: 'Access denied',
          data: 'Admin privileges required. Only administrators can populate vehicle images.'
        }
      }
    }

    // Validate required fields
    if (!args.vehicleId || !args.model) {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32602,
          message: 'Invalid params',
          data: 'vehicleId and model are required'
        }
      }
    }

    console.log('All validations passed, starting image population...')

    // Create a user-specific client for storage operations
    // For service tokens, use the service key directly
    const supabaseUser = isServiceToken 
      ? supabaseAdmin 
      : createClient(supabaseUrl, supabaseServiceKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        })

    // Step 1: Search for vehicle images using Google Search
    console.log('Searching for vehicle images using Google Search...')
    
    // Build search query
    const searchQuery = `${args.manufacturer || ''} ${args.model} ${args.trim || ''} car image`.trim()
    console.log('Search query:', searchQuery)

    // Call google-search-mcp function
    const searchResponse = await fetch(`${supabaseUrl}/functions/v1/google-search-mcp`, {
      method: 'POST',
      headers: {
        'Authorization': isServiceToken ? `Bearer ${supabaseServiceKey}` : `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'image_search',
          arguments: {
            query: searchQuery,
            num_results: args.maxImages || 8,
            image_size: 'large',
            image_type: 'photo'
          }
        }
      })
    })

    if (!searchResponse.ok) {
      throw new Error(`Google Search API returned ${searchResponse.status}: ${searchResponse.statusText}`)
    }

    const searchResult = await searchResponse.json()
    console.log('Google Search response:', JSON.stringify(searchResult, null, 2))

    if (!searchResult.result?.content?.[0]?.text) {
      throw new Error('No search results returned from Google Search API')
    }

    const searchData = JSON.parse(searchResult.result.content[0].text)
    console.log('Parsed search data:', JSON.stringify(searchData, null, 2))

    if (!searchData.success || !searchData.results || searchData.results.length === 0) {
      throw new Error('No images found in search results')
    }

    console.log(`Found ${searchData.results.length} images from Google Search`)

    // Step 2: Download and upload images
    const uploadedImages = []
    const errors = []

    for (let i = 0; i < Math.min(searchData.results.length, args.maxImages || 8); i++) {
      const imageResult = searchData.results[i]
      console.log(`Processing image ${i + 1}/${searchData.results.length}:`, imageResult.link)

      try {
        // Download image
        const imageResponse = await fetch(imageResult.link)
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`)
        }

        const imageData = new Uint8Array(await imageResponse.arrayBuffer())
        console.log(`Downloaded image ${i + 1}, size: ${imageData.length} bytes`)

        // Generate filename and path
        const fileExtension = imageResult.link.split('.').pop()?.split('?')[0] || 'jpg'
        const fileName = `${args.vehicleId}_${Date.now()}_${i}.${fileExtension}`
        const filePath = `${args.vehicleId}/${fileName}`

        // Upload to Supabase storage
        console.log(`Uploading image ${i + 1} to storage:`, filePath)
        const uploadResponse = await supabaseUser.storage
          .from('vehicle-images')
          .upload(filePath, imageData, {
            contentType: imageResponse.headers.get('content-type') || 'image/jpeg',
            upsert: false
          })

        if (uploadResponse.error) {
          throw new Error(`Storage upload failed: ${uploadResponse.error.message}`)
        }

        console.log(`Image ${i + 1} uploaded successfully!`)

        // Step 3: Insert record into vehicle_images table
        const imageRecord = {
          vehicle_id: args.vehicleId,
          image_url: `${supabaseUrl}/storage/v1/object/public/vehicle-images/${filePath}`,
          image_path: filePath,
          image_name: fileName,
          image_type: 'gallery',
          file_size: imageData.length,
          width: imageResult.width || null,
          height: imageResult.height || null,
          alt_text: imageResult.title || `Image of ${args.model} ${args.trim || ''}`.trim(),
          display_order: i,
          is_active: true
        }

        console.log(`Inserting record for image ${i + 1}:`, JSON.stringify(imageRecord, null, 2))

        const { data: insertData, error: insertError } = await supabaseUser
          .from('vehicle_images')
          .insert([imageRecord])
          .select()

        if (insertError) {
          throw new Error(`Database insert failed: ${insertError.message}`)
        }

        console.log(`Image ${i + 1} record inserted successfully!`)
        uploadedImages.push(insertData?.[0])

      } catch (imageError) {
        console.error(`Error processing image ${i + 1}:`, imageError)
        errors.push(`Image ${i + 1}: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`)
      }
    }

    const result = {
      success: uploadedImages.length > 0,
      imagesUploaded: uploadedImages.length,
      imagesSearched: searchData.results.length,
      errors: errors,
      message: `Successfully uploaded ${uploadedImages.length} images for ${args.model}`,
      uploadedImages: uploadedImages
    }

    console.log('Final result:', result)

    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }

  } catch (error) {
    console.error('Error in populate-images execution:', error)
    
    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: 'Internal error',
        data: `populate-images execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Main request handler
serve(async (req) => {
  console.log('=== MCP SERVER FUNCTION CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get authorization header (only required for tools/call)
    const authHeader = req.headers.get('Authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '') : null
    
    // For service tokens, we need to handle them specially
    // Service tokens start with 'sbp_' and are not JWT tokens
    const isServiceToken = token && token.startsWith('sbp_')
    
    // Parse request body
    let requestBody: any
    try {
      const rawBody = await req.text()
      console.log('Raw request body:', rawBody)
      requestBody = JSON.parse(rawBody)
      console.log('Parsed request body:', JSON.stringify(requestBody, null, 2))
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate JSON-RPC 2.0 format
    if (!requestBody.jsonrpc || requestBody.jsonrpc !== '2.0' || !requestBody.method) {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: requestBody.id || null,
          error: {
            code: -32600,
            message: 'Invalid Request',
            data: 'Request must be valid JSON-RPC 2.0 format'
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let response: any

    // Route MCP requests
    switch (requestBody.method) {
      case 'initialize':
        response = handleInitialize(requestBody)
        break
      
      case 'tools/list':
        response = handleToolsList(requestBody)
        break
      
      case 'tools/call':
        // Require authentication for tool execution
        if (!token) {
          response = {
            jsonrpc: '2.0',
            id: requestBody.id,
            error: {
              code: -32000,
              message: 'Authentication required',
              data: 'Authorization header required for tool execution'
            }
          }
        } else {
          // For service tokens, we'll pass a special flag
          response = await handleToolsCall(requestBody, token, isServiceToken)
        }
        break
      
      default:
        response = {
          jsonrpc: '2.0',
          id: requestBody.id,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Method '${requestBody.method}' is not supported`
          }
        }
    }

    console.log('MCP Server response:', JSON.stringify(response, null, 2))

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in MCP server function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
