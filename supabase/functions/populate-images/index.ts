import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client - we'll create it with the user's token later
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

console.log('Supabase URL:', supabaseUrl)
console.log('Service key present:', !!supabaseServiceKey)
console.log('Service key length:', supabaseServiceKey?.length || 0)

// Create service role client for admin checks
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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

// Main request handler
serve(async (req) => {
  console.log('=== MINIMAL POPULATE IMAGES FUNCTION CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting request processing...')
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method)
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Method is POST, continuing...')

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    if (!authHeader) {
      console.log('No authorization header')
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Auth header found, verifying token...')

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '')
    console.log('Token length:', token.length)
    
            console.log('Creating Supabase client...')
            const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
            console.log('Supabase auth call completed')
            
            // Create a user-specific client for storage operations
            const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
              global: {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            })
    
    if (authError || !user) {
      console.log('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User authenticated:', user.id)

    // Check admin permission
    console.log('Checking admin permission for user:', user.id)
    const isAdmin = await checkAdminPermission(user.id)
    console.log('Is admin:', isAdmin)
    
    if (!isAdmin) {
      console.log('User is not admin, denying access')
      return new Response(
        JSON.stringify({ 
          error: 'Admin privileges required',
          message: 'Only administrators can populate vehicle images. Please contact an administrator to grant you admin access.'
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin check passed, parsing request body...')

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
    
    // Validate required fields
    if (!requestBody.vehicleId || !requestBody.model) {
      console.log('Validation failed - missing required fields:', {
        vehicleId: requestBody.vehicleId,
        model: requestBody.model
      })
      return new Response(
        JSON.stringify({ 
          error: 'vehicleId and model are required',
          received: {
            vehicleId: requestBody.vehicleId,
            model: requestBody.model,
            trim: requestBody.trim,
            manufacturer: requestBody.manufacturer
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('All validations passed, starting image population...')

    // Step 1: Search for vehicle images using Google Search
    console.log('Searching for vehicle images using Google Search...')
    
    try {
      // Build search query
      const searchQuery = `${requestBody.manufacturer} ${requestBody.model} ${requestBody.trim || ''} car image`.trim()
      console.log('Search query:', searchQuery)

      // Call google-search-mcp function
      const searchResponse = await fetch(`${supabaseUrl}/functions/v1/google-search-mcp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
              num_results: requestBody.maxImages || 8,
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

      for (let i = 0; i < Math.min(searchData.results.length, requestBody.maxImages || 8); i++) {
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
          const fileName = `${requestBody.vehicleId}_${Date.now()}_${i}.${fileExtension}`
          const filePath = `${requestBody.vehicleId}/${fileName}`

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
            vehicle_id: requestBody.vehicleId,
            image_url: `${supabaseUrl}/storage/v1/object/public/vehicle-images/${filePath}`,
            image_path: filePath,
            image_name: fileName,
            image_type: 'gallery',
            file_size: imageData.length,
            width: imageResult.width || null,
            height: imageResult.height || null,
            alt_text: imageResult.title || `Image of ${requestBody.model} ${requestBody.trim || ''}`.trim(),
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
        message: `Successfully uploaded ${uploadedImages.length} images for ${requestBody.model}`,
        uploadedImages: uploadedImages
      }

      console.log('Final result:', result)

      return new Response(
        JSON.stringify(result),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (error) {
      console.error('Error in test image upload:', error)
      return new Response(
        JSON.stringify({
          success: false,
          imagesUploaded: 0,
          imagesSearched: 0,
          errors: [`Test image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          message: 'Test image upload failed'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in populate-images function:', error)
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