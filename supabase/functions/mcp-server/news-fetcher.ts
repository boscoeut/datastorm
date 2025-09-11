import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1'

// Types for news article functionality
export interface NewsFetchParams {
  manufacturer: string
  model: string
  trim?: string
  year?: number
  maxArticles?: number
}

export interface IndustryNewsFetchParams {
  maxArticles?: number
  category?: string
  timeRange?: 'day' | 'week' | 'month' | 'year'
}

export interface NewsArticle {
  title: string
  summary: string
  source_url: string
  source_name: string
  category: string
  tags: string[]
  published_date: string
  image_url?: string
  image_path?: string
  image_name?: string
  image_size?: number
  image_width?: number
  image_height?: number
}

export interface NewsFetchResult {
  success: boolean
  message: string
  data: {
    articles_added: number
    articles_skipped: number
    total_processed: number
    categories: string[]
    sources: string[]
  }
  timestamp: string
  source: string
  error?: string
}

// Google Search API types
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

// Generate AI image using Gemini and image generation API
async function generateArticleImage(
  articleTitle: string, 
  articleSummary: string, 
  category: string,
  articleId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<string | null> {
  try {
    console.log('🎨 Generating AI image for article:', articleTitle);
    
    // Create a detailed prompt for image generation
    const imagePrompt = `Create a professional, high-quality image for a news article about: "${articleTitle}"

Article Summary: ${articleSummary}
Category: ${category}

The image should be:
- Professional and newsworthy
- Related to electric vehicles, automotive technology, or industry news
- High resolution (at least 800x600 pixels)
- Clean, modern design
- Suitable for a news website
- No text overlays or watermarks

Style: Professional photography or illustration, clean and modern, suitable for news media.`;

    const response = await callGeminiAPI({
      task: 'generate_article_image',
      prompt: imagePrompt,
      expectedOutput: 'A detailed description of an image that can be used to generate a visual representation of the news article',
      temperature: 0.7
    });

    if (response.text) {
      console.log('✅ AI image description generated:', response.text.substring(0, 100) + '...');
      
      // Try to generate an actual image using Pollinations.ai and store it
      const generatedImageUrl = await generateImageWithAPI(
        response.text, 
        articleTitle, 
        category,
        articleId,
        supabaseUrl,
        supabaseServiceKey
      );
      
      if (generatedImageUrl) {
        console.log('🖼️ AI image generated and stored successfully:', generatedImageUrl);
        return generatedImageUrl;
      } else {
        // Fallback to sophisticated placeholder
        console.log('🖼️ AI image generation failed, using placeholder');
        const encodedTitle = encodeURIComponent(articleTitle.substring(0, 50));
        const categoryColor = getCategoryColor(category);
        const aiImageUrl = `https://via.placeholder.com/800x600/${categoryColor}/FFFFFF?text=${encodedTitle}`;
        
        console.log('🖼️ Using placeholder image:', aiImageUrl);
        return aiImageUrl;
      }
    }

    return null;
  } catch (error) {
    console.warn('Error generating AI image:', error);
    return null;
  }
}

// Generate actual image using Pollinations.ai API and store it in Supabase
async function generateImageWithAPI(
  description: string, 
  articleTitle: string, 
  category: string,
  articleId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<string | null> {
  try {
    // Create a refined prompt for Pollinations.ai
    const pollinationsPrompt = `Professional news article image: ${description}. 
    Style: Clean, modern, professional photography. 
    Subject: Electric vehicles, automotive technology, or industry news. 
    Quality: High resolution, suitable for news website. 
    No text, no watermarks.`;

    console.log('🎨 Generating image with Pollinations.ai...');
    console.log('📝 Prompt:', pollinationsPrompt.substring(0, 100) + '...');
    
    // Pollinations.ai REST API endpoint
    const encodedPrompt = encodeURIComponent(pollinationsPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    const params = new URLSearchParams({
      width: '1024',
      height: '1024',
      model: 'flux',
      nologo: 'true',
      quality: '80'
    });

    const fullUrl = `${pollinationsUrl}?${params.toString()}`;
    console.log('🌐 Requesting URL:', fullUrl.substring(0, 200) + '...');

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'image/*',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Pollinations.ai API error:', response.status, response.statusText);
      return null;
    }

    // Check if request was aborted due to timeout
    if (response.status === 0) {
      console.warn('Pollinations.ai request timed out');
      return null;
    }

    // Check if the response is actually an image
    const contentType = response.headers.get('content-type') || '';
    console.log('🔍 Response content type:', contentType);
    
    if (!contentType.startsWith('image/')) {
      // If it's not an image, log the response for debugging
      const responseText = await response.text();
      console.warn('❌ Pollinations.ai returned non-image content:', responseText.substring(0, 200));
      return null;
    }
    
    // Download the generated image
    const imageData = await response.arrayBuffer();
    
    // Validate that we actually got image data
    if (imageData.byteLength < 1024) {
      console.warn('❌ Received image data too small, likely not a valid image');
      return null;
    }
    
    // Generate file path for storage
    const timestamp = Date.now();
    const sanitizedTitle = articleTitle.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
    const extension = contentType.split('/')[1] || 'jpg';
    const fileName = `ai_generated_${timestamp}_${sanitizedTitle}.${extension}`;
    const filePath = `articles/${articleId}/${fileName}`;
    
    console.log('📁 Storing image:', filePath, 'Size:', imageData.byteLength, 'bytes');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(filePath, imageData, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType
      });

    if (uploadError) {
      console.warn('Failed to store AI-generated image:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('news-images')
      .getPublicUrl(filePath);

    console.log('✅ AI-generated image stored successfully:', urlData.publicUrl);
    console.log('🔄 Returning from generateImageWithAPI with URL:', urlData.publicUrl);
    return urlData.publicUrl;
    
  } catch (error) {
    console.warn('Error generating and storing image with Pollinations.ai:', error);
    return null;
  }
}

// Helper function to get category-specific colors for placeholder images
function getCategoryColor(category: string): string {
  switch (category?.toLowerCase()) {
    case 'technology':
      return '4F46E5'; // Indigo
    case 'market trends':
      return '059669'; // Emerald
    case 'policy':
      return 'DC2626'; // Red
    case 'infrastructure':
      return 'EA580C'; // Orange
    case 'manufacturing':
      return '7C3AED'; // Violet
    case 'startups':
      return 'DB2777'; // Pink
    case 'investment':
      return '0891B2'; // Cyan
    case 'safety':
      return 'CA8A04'; // Yellow
    case 'performance':
      return '16A34A'; // Green
    default:
      return '6B7280'; // Gray
  }
}

// Download and store image function
async function downloadAndStoreImage(
  imageUrl: string, 
  articleId: string, 
  articleTitle: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<{ success: boolean; imageUrl?: string; imagePath?: string; error?: string }> {
  try {
    console.log('📥 Downloading and storing image from:', imageUrl);
    
    // Validate URL
    if (!imageUrl || !imageUrl.startsWith('http')) {
      throw new Error('Invalid image URL');
    }

    // Download the image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'image/*',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    const allowedTypes = ['image/jpeg', 'image/jpeg', 'image/png', 'image/webp'];
    
    if (!contentType || !allowedTypes.includes(contentType)) {
      throw new Error(`Unsupported image type: ${contentType}`);
    }

    const imageData = await response.arrayBuffer();
    const fileSize = imageData.byteLength;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (fileSize > maxFileSize) {
      throw new Error(`Image too large: ${fileSize} bytes`);
    }

    if (fileSize < 1024) { // Less than 1KB
      throw new Error('Image too small, likely not a valid image');
    }

    // Generate file path
    const timestamp = Date.now();
    const sanitizedTitle = articleTitle.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
    const extension = contentType.split('/')[1] || 'jpg';
    const fileName = `${timestamp}_${sanitizedTitle}.${extension}`;
    const filePath = `articles/${articleId}/${fileName}`;
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(filePath, imageData, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('news-images')
      .getPublicUrl(filePath);

    console.log('✅ Image stored successfully:', urlData.publicUrl);
    
    return {
      success: true,
      imageUrl: urlData.publicUrl,
      imagePath: filePath
    };
  } catch (error) {
    console.error('❌ Failed to download and store image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    };
  }
}

// Direct Gemini API function
async function callGeminiAPI(request: {
  task: string;
  prompt: string;
  data?: Record<string, any>;
  expectedOutput?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string; usage?: any }> {
  try {
    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    // Initialize Google Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model with web grounding
    const model = genAI.getGenerativeModel({
      model: request.model || 'gemini-2.5-flash',
      tools: [{
        googleSearch: {}, // This enables Google Search grounding
      }],
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 2048,
      },
    });

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

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: content }] }]
    });

    const response = await result.response;
    const text = response.text();

    // Get usage information if available
    const usage = response.usageMetadata ? {
      promptTokens: response.usageMetadata.promptTokenCount || 0,
      completionTokens: response.usageMetadata.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata.totalTokenCount || 0,
    } : undefined;

    return {
      text,
      usage,
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Main industry news fetch function
export async function fetchIndustryNews(
  params: IndustryNewsFetchParams,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<NewsFetchResult> {
  console.log('📰 Starting industry news fetch process for:', params);
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Initialize counters
  const counters = {
    articles_added: 0,
    articles_skipped: 0,
    total_processed: 0,
    categories: [] as string[],
    sources: [] as string[]
  };

  try {
    // Step 1: Search for industry news articles
    console.log('🔍 Searching for industry news articles...');
    const newsArticles = await searchIndustryNews(params);

    // Step 2: Process each article
    console.log('📊 Processing industry news articles...');
    for (const article of newsArticles) {
      // Validate and truncate article fields before processing
      const validatedArticle = validateAndTruncateNewsArticle(article);
      
      // AI image generation will be handled in processNewsArticle after article creation
      
      const articleResult = await processNewsArticle(validatedArticle, supabase, supabaseUrl, supabaseServiceKey);
      counters.articles_added += articleResult.added;
      counters.articles_skipped += articleResult.skipped;
      counters.total_processed += 1;
      
      // Track unique categories and sources
      if (!counters.categories.includes(validatedArticle.category)) {
        counters.categories.push(validatedArticle.category);
      }
      if (!counters.sources.includes(validatedArticle.source_name)) {
        counters.sources.push(validatedArticle.source_name);
      }
    }

    const result: NewsFetchResult = {
      success: true,
      message: `Successfully processed ${counters.total_processed} industry news articles`,
      data: counters,
      timestamp: new Date().toISOString(),
      source: 'mcp-server-industry-news-fetcher'
    };

    console.log('✅ Industry news fetch completed successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error in industry news fetch process:', error);
    
    return {
      success: false,
      message: 'Industry news fetch failed',
      data: counters,
      timestamp: new Date().toISOString(),
      source: 'mcp-server-industry-news-fetcher',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Main vehicle news fetch function
export async function fetchVehicleNews(
  params: NewsFetchParams,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<NewsFetchResult> {
  console.log('📰 Starting news fetch process for:', params);
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Initialize counters
  const counters = {
    articles_added: 0,
    articles_skipped: 0,
    total_processed: 0,
    categories: [] as string[],
    sources: [] as string[]
  };

  try {
    // Step 1: Search for news articles
    console.log('🔍 Searching for news articles...');
    const newsArticles = await searchVehicleNews(params);

    // Step 2: Process each article
    console.log('📊 Processing news articles...');
    for (const article of newsArticles) {
      // Validate and truncate article fields before processing
      const validatedArticle = validateAndTruncateNewsArticle(article);
      
      // AI image generation will be handled in processNewsArticle after article creation
      
      const articleResult = await processNewsArticle(validatedArticle, supabase, supabaseUrl, supabaseServiceKey);
      counters.articles_added += articleResult.added;
      counters.articles_skipped += articleResult.skipped;
      counters.total_processed += 1;
      
      // Track unique categories and sources
      if (!counters.categories.includes(validatedArticle.category)) {
        counters.categories.push(validatedArticle.category);
      }
      if (!counters.sources.includes(validatedArticle.source_name)) {
        counters.sources.push(validatedArticle.source_name);
      }
    }

    const result: NewsFetchResult = {
      success: true,
      message: `Successfully processed ${counters.total_processed} news articles for ${params.manufacturer} ${params.model}`,
      data: counters,
      timestamp: new Date().toISOString(),
      source: 'mcp-server-news-fetcher'
    };

    console.log('✅ News fetch completed successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error in news fetch process:', error);
    
    return {
      success: false,
      message: 'News fetch failed',
      data: counters,
      timestamp: new Date().toISOString(),
      source: 'mcp-server-news-fetcher',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Search for real industry news articles using Gemini with web search
async function searchIndustryNews(params: IndustryNewsFetchParams): Promise<NewsArticle[]> {
  console.log('🔍 Searching for real industry news articles with Gemini for:', params);
  
  // Build search queries for different aspects of EV industry news
  let searchQueries = [
    'electric vehicle industry news',
    'EV market trends sales data',
    'battery technology advances electric vehicles',
    'EV charging infrastructure news',
    'electric vehicle policy regulations',
    'EV manufacturing production news',
    'electric vehicle startup funding investment',
    'autonomous electric vehicles news',
    'EV environmental impact sustainability'
  ];

  // Add time-based search modifiers if timeRange is specified
  if (params.timeRange) {
    const timeModifiers = {
      'day': 'today',
      'week': 'this week',
      'month': 'this month',
      'year': 'this year'
    };
    
    const timeModifier = timeModifiers[params.timeRange];
    if (timeModifier) {
      searchQueries = searchQueries.map(query => `${query} ${timeModifier}`);
    }
  }

  // Add category-specific search if specified
  if (params.category) {
    const categoryQueries = {
      'technology': ['electric vehicle technology breakthroughs', 'EV battery innovations', 'EV charging technology'],
      'market': ['electric vehicle sales', 'EV market share statistics', 'electric car sales data'],
      'policy': ['electric vehicle policy', 'EV incentives regulations', 'government EV support'],
      'infrastructure': ['EV charging infrastructure', 'electric vehicle charging stations', 'EV charging network']
    };
    
    if (categoryQueries[params.category as keyof typeof categoryQueries]) {
      searchQueries.push(...categoryQueries[params.category as keyof typeof categoryQueries]);
    }
  }

  // Build a comprehensive prompt for Gemini to search and extract real news articles
  const prompt = `

Today's date is ${new Date().toISOString().split('T')[0]}.
  
Search the web for real, current news articles about the electric vehicle industry. Use the following search queries to find actual news articles:

${searchQueries.map((query, index) => `${index + 1}. "${query}"`).join('\n')}

${params.category ? `Focus specifically on: ${params.category} related news` : ''}
${params.timeRange ? `Time range: ${params.timeRange} (prioritize articles from ${params.timeRange === 'day' ? 'today' : `the last ${params.timeRange}`})` : ''}

For each real news article you find, extract and provide:
- The actual article title (exactly as published)
- A summary of the article content (2-3 sentences based on the real article)
- The actual source URL (the real news article URL)
- The actual source name (the real news outlet)
- A relevant category (Technology, Market Trends, Policy, Infrastructure, Manufacturing, Startups, Investment, Safety, Performance, General)
- 3-5 relevant tags based on the article content
- The actual published date (if available, otherwise use recent date)
- Set image_url to null (images will be generated separately)

Find ${params.maxArticles || 20} real news articles from reputable sources like:
- Reuters, Bloomberg, TechCrunch, The Verge, Electrek, InsideEVs
- Automotive News, Car and Driver, MotorTrend
- CNBC, Wall Street Journal, Financial Times
- Government and industry publications

Make sure to:
1. Only include real, published news articles
2. Use actual URLs and source names
3. Base summaries on real article content
4. ${params.timeRange ? `Prioritize articles from ${params.timeRange === 'day' ? 'today' : `the last ${params.timeRange}`}` : 'Include recent articles (within the last 30 days when possible)'}
5. Provide diverse coverage across different EV industry topics

Return the results as a JSON array of news article objects.`;

  try {
    const response = await callGeminiAPI({
      task: 'search_industry_news_articles',
      prompt,
      expectedOutput: 'JSON array of news article objects',
      temperature: 0.3
    });

    if (response.text) {
      console.log('✅ Gemini found real industry news articles');
      
      // Parse the JSON response
      let responseText = response.text.trim();
      
      // Remove any markdown code blocks
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find JSON array in the response
      const arrayMatch = responseText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        responseText = arrayMatch[0];
      }
      
      console.log('📊 Parsing Gemini response for industry news articles');
      const articles = JSON.parse(responseText);
      
      if (Array.isArray(articles)) {
        console.log(`✅ Found ${articles.length} real industry news articles`);
        return articles.slice(0, params.maxArticles || 20);
      } else {
        console.warn('Gemini returned non-array response, wrapping in array');
        return [articles].slice(0, params.maxArticles || 20);
      }
    }

    console.warn('No response text from Gemini for industry news search');
    return [];
  } catch (error) {
    console.error('Error searching for industry news with Gemini:', error);
    return [];
  }
}

// Search for real vehicle news articles using Gemini with web search
async function searchVehicleNews(params: NewsFetchParams): Promise<NewsArticle[]> {
  console.log('🔍 Searching for real vehicle news articles with Gemini for:', params);
  
  // Determine the target year
  const currentYear = new Date().getFullYear();
  const targetYear = params.year || currentYear;
  
  // Build search queries for the specific vehicle
  const searchQueries = [
    `${params.manufacturer} ${params.model} ${targetYear} news`,
    `${params.manufacturer} ${params.model} ${targetYear} review`,
    `${params.manufacturer} ${params.model} ${targetYear} price`,
    `${params.manufacturer} ${params.model} ${targetYear} test drive`,
    `${params.manufacturer} ${params.model} ${targetYear} specifications`,
    `${params.manufacturer} ${params.model} ${targetYear} performance`,
    `${params.manufacturer} ${params.model} ${targetYear} safety`,
    `${params.manufacturer} ${params.model} ${targetYear} comparison`,
    `${params.manufacturer} ${params.model} ${targetYear} update`
  ];

  // Add trim-specific search if specified
  if (params.trim) {
    searchQueries.push(`${params.manufacturer} ${params.model} ${params.trim} ${targetYear}`);
  }

  // Build a comprehensive prompt for Gemini to search and extract real news articles
  const prompt = `Search the web for real, current news articles about the ${params.manufacturer} ${params.model} ${targetYear}. Use the following search queries to find actual news articles:

${searchQueries.map((query, index) => `${index + 1}. "${query}"`).join('\n')}

${params.trim ? `Focus specifically on the ${params.trim} trim level when available.` : ''}

For each real news article you find, extract and provide:
- The actual article title (exactly as published)
- A summary of the article content (2-3 sentences based on the real article)
- The actual source URL (the real news article URL)
- The actual source name (the real news outlet)
- A relevant category (Reviews, Market Trends, Technology, Performance, Safety, General)
- 3-5 relevant tags including the manufacturer, model, and year
- The actual published date (if available, otherwise use recent date)
- Set image_url to null (images will be generated separately)

Find ${params.maxArticles || 20} real news articles from reputable automotive sources like:
- MotorTrend, Car and Driver, Autoblog, InsideEVs, Electrek
- Automotive News, Road & Track, Car and Driver
- CNBC, Reuters, Bloomberg (for business/market news)
- Manufacturer press releases and official announcements
- Professional automotive journalism outlets

Make sure to:
1. Only include real, published news articles
2. Use actual URLs and source names
3. Base summaries on real article content
4. Include recent articles (within the last 30 days when possible)
5. Cover diverse topics: reviews, pricing, technology, performance, safety
6. Include both positive and critical coverage when available

Return the results as a JSON array of news article objects.`;

  try {
    const response = await callGeminiAPI({
      task: 'search_vehicle_news_articles',
      prompt,
      expectedOutput: 'JSON array of news article objects',
      temperature: 0.3
    });

    if (response.text) {
      console.log('✅ Gemini found real vehicle news articles');
      
      // Parse the JSON response
      let responseText = response.text.trim();
      
      // Remove any markdown code blocks
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find JSON array in the response
      const arrayMatch = responseText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        responseText = arrayMatch[0];
      }
      
      console.log('📊 Parsing Gemini response for vehicle news articles');
      const articles = JSON.parse(responseText);
      
      if (Array.isArray(articles)) {
        console.log(`✅ Found ${articles.length} real vehicle news articles`);
        return articles.slice(0, params.maxArticles || 20);
      } else {
        console.warn('Gemini returned non-array response, wrapping in array');
        return [articles].slice(0, params.maxArticles || 20);
      }
    }

    console.warn('No response text from Gemini for vehicle news search');
    return [];
  } catch (error) {
    console.error('Error searching for vehicle news with Gemini:', error);
    return [];
  }
}

// These functions are no longer needed as we search for real articles with Gemini

// Helper function to truncate text to fit database constraints
function truncateForDatabase(text: string | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Helper function to validate and truncate NewsArticle fields
function validateAndTruncateNewsArticle(article: NewsArticle): NewsArticle {
  console.log('🔍 Original article fields:');
  console.log('  title:', article.title?.substring(0, 50) + '...', 'length:', article.title?.length || 0);
  console.log('  summary:', article.summary?.substring(0, 50) + '...', 'length:', article.summary?.length || 0);
  console.log('  source_url:', article.source_url?.substring(0, 50) + '...', 'length:', article.source_url?.length || 0);
  console.log('  source_name:', article.source_name?.substring(0, 50) + '...', 'length:', article.source_name?.length || 0);
  console.log('  category:', article.category?.substring(0, 50) + '...', 'length:', article.category?.length || 0);

  // Be extra conservative with truncation to avoid any database errors
  const truncated = {
    ...article,
    title: truncateForDatabase(article.title, 450), // VARCHAR(500) - be conservative
    summary: truncateForDatabase(article.summary, 950), // VARCHAR(1000) - be conservative
    source_url: truncateForDatabase(article.source_url, 450), // VARCHAR(500) - be conservative
    source_name: truncateForDatabase(article.source_name, 200), // VARCHAR(255) - be conservative
    category: truncateForDatabase(article.category, 80), // VARCHAR(100) - be conservative
    image_url: truncateForDatabase(article.image_url, 450), // VARCHAR(500) - be conservative
    // tags and published_date don't need truncation
    // image_path, image_name, image_size, image_width, image_height are handled separately
  };

  console.log('🔍 Truncated article fields:');
  console.log('  title:', truncated.title?.substring(0, 50) + '...', 'length:', truncated.title?.length || 0);
  console.log('  summary:', truncated.summary?.substring(0, 50) + '...', 'length:', truncated.summary?.length || 0);
  console.log('  source_url:', truncated.source_url?.substring(0, 50) + '...', 'length:', truncated.source_url?.length || 0);
  console.log('  source_name:', truncated.source_name?.substring(0, 50) + '...', 'length:', truncated.source_name?.length || 0);
  console.log('  category:', truncated.category?.substring(0, 50) + '...', 'length:', truncated.category?.length || 0);
  console.log('  image_url:', truncated.image_url?.substring(0, 50) + '...', 'length:', truncated.image_url?.length || 0);

  // Log any truncation that occurred
  if (article.title && article.title.length > 450) {
    console.log('⚠️ Title truncated from', article.title.length, 'to 450 characters');
  }
  if (article.summary && article.summary.length > 950) {
    console.log('⚠️ Summary truncated from', article.summary.length, 'to 950 characters');
  }
  if (article.source_url && article.source_url.length > 450) {
    console.log('⚠️ Source URL truncated from', article.source_url.length, 'to 450 characters');
  }
  if (article.source_name && article.source_name.length > 200) {
    console.log('⚠️ Source name truncated from', article.source_name.length, 'to 200 characters');
  }
  if (article.category && article.category.length > 80) {
    console.log('⚠️ Category truncated from', article.category.length, 'to 80 characters');
  }
  if (article.image_url && article.image_url.length > 450) {
    console.log('⚠️ Image URL truncated from', article.image_url.length, 'to 450 characters');
  }

  return truncated;
}

// Process individual news article in database
async function processNewsArticle(article: NewsArticle, supabase: any, supabaseUrl: string, supabaseServiceKey: string) {
  console.log('📰 Processing news article:', article.title);
  
  // Validate and truncate fields to fit current database constraints
  const truncatedArticle = validateAndTruncateNewsArticle(article);

  // Log if truncation occurred
  if (article.title && article.title.length > 500) {
    console.log('⚠️ Title truncated from', article.title.length, 'to 500 characters');
  }
  if (article.summary && article.summary.length > 1000) {
    console.log('⚠️ Summary truncated from', article.summary.length, 'to 1000 characters');
  }
  if (article.source_url && article.source_url.length > 500) {
    console.log('⚠️ Source URL truncated from', article.source_url.length, 'to 500 characters');
  }
  if (article.source_name && article.source_name.length > 255) {
    console.log('⚠️ Source name truncated from', article.source_name.length, 'to 255 characters');
  }
  if (article.category && article.category.length > 100) {
    console.log('⚠️ Category truncated from', article.category.length, 'to 100 characters');
  }
  
  // Check if article exists
  const { data: existingArticle, error: checkError } = await supabase
    .from('news_articles')
    .select('*')
    .eq('source_url', truncatedArticle.source_url)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Error checking news article: ${checkError.message}`);
  }

  if (existingArticle) {
    console.log('⏭️ News article already exists, skipping:', truncatedArticle.title);
    return { added: 0, skipped: 1 };
  } else {
    // Debug: Log field lengths before insertion
    console.log('🔍 Field lengths before insertion:');
    console.log('  title length:', truncatedArticle.title?.length || 0, 'value:', truncatedArticle.title?.substring(0, 50) + '...');
    console.log('  summary length:', truncatedArticle.summary?.length || 0, 'value:', truncatedArticle.summary?.substring(0, 50) + '...');
    console.log('  source_url length:', truncatedArticle.source_url?.length || 0, 'value:', truncatedArticle.source_url?.substring(0, 50) + '...');
    console.log('  source_name length:', truncatedArticle.source_name?.length || 0, 'value:', truncatedArticle.source_name?.substring(0, 50) + '...');
    console.log('  category length:', truncatedArticle.category?.length || 0, 'value:', truncatedArticle.category?.substring(0, 50) + '...');

    // Safety check: Ensure no field exceeds database limits
    const safeArticle = {
      title: (truncatedArticle.title || '').substring(0, 500),
      summary: (truncatedArticle.summary || '').substring(0, 1000),
      source_url: (truncatedArticle.source_url || '').substring(0, 500),
      source_name: (truncatedArticle.source_name || '').substring(0, 255),
      category: (truncatedArticle.category || '').substring(0, 100),
      tags: truncatedArticle.tags || [],
      published_date: truncatedArticle.published_date || new Date().toISOString().split('T')[0],
      image_url: (truncatedArticle.image_url || '').substring(0, 500) // VARCHAR(500) limit
    };

    // Final validation - ensure no field is too long
    if (safeArticle.title.length > 500) {
      console.error('❌ Title still too long after truncation:', safeArticle.title.length);
      safeArticle.title = safeArticle.title.substring(0, 500);
    }
    if (safeArticle.summary.length > 1000) {
      console.error('❌ Summary still too long after truncation:', safeArticle.summary.length);
      safeArticle.summary = safeArticle.summary.substring(0, 1000);
    }
    if (safeArticle.source_url.length > 500) {
      console.error('❌ Source URL still too long after truncation:', safeArticle.source_url.length);
      safeArticle.source_url = safeArticle.source_url.substring(0, 500);
    }
    if (safeArticle.source_name.length > 255) {
      console.error('❌ Source name still too long after truncation:', safeArticle.source_name.length);
      safeArticle.source_name = safeArticle.source_name.substring(0, 255);
    }
    if (safeArticle.category.length > 100) {
      console.error('❌ Category still too long after truncation:', safeArticle.category.length);
      safeArticle.category = safeArticle.category.substring(0, 100);
    }
    if (safeArticle.image_url.length > 500) {
      console.error('❌ Image URL still too long after truncation:', safeArticle.image_url.length);
      safeArticle.image_url = safeArticle.image_url.substring(0, 500);
    }

    console.log('🔍 Safe field lengths:');
    console.log('  title length:', safeArticle.title.length);
    console.log('  summary length:', safeArticle.summary.length);
    console.log('  source_url length:', safeArticle.source_url.length);
    console.log('  source_name length:', safeArticle.source_name.length);
    console.log('  category length:', safeArticle.category.length);
    console.log('  image_url length:', safeArticle.image_url.length);

    // Create new article first to get the ID
    let newArticle;
    try {
      const { data, error: createError } = await supabase
        .from('news_articles')
        .insert([{
          title: safeArticle.title,
          summary: safeArticle.summary,
          source_url: safeArticle.source_url,
          source_name: safeArticle.source_name,
          category: safeArticle.category,
          tags: safeArticle.tags,
          published_date: safeArticle.published_date,
          image_url: safeArticle.image_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Database error details:', createError);
        console.error('❌ Safe article data:', JSON.stringify(safeArticle, null, 2));
        throw new Error(`Error creating news article: ${createError.message}`);
      }
      
      newArticle = data;
    } catch (error) {
      console.error('❌ Database insertion failed:', error);
      console.error('❌ Safe article data:', JSON.stringify(safeArticle, null, 2));
      throw error;
    }

    console.log('✅ News article created:', truncatedArticle.title);

    // Handle image processing for the article
    if (newArticle?.id) {
      let imageStored = false;
      
      // If we have an external image URL, try to download and store it
      if (truncatedArticle.image_url) {
        console.log('🖼️ Attempting to download and store external image for article:', truncatedArticle.title);
        
        try {
          const imageResult = await downloadAndStoreImage(
            truncatedArticle.image_url,
            newArticle.id,
            truncatedArticle.title,
            supabaseUrl,
            supabaseServiceKey
          );

          if (imageResult.success && imageResult.imageUrl && imageResult.imagePath) {
            // Update the article with the stored image information
            const { error: updateError } = await supabase
              .from('news_articles')
              .update({
                image_url: imageResult.imageUrl,
                image_path: imageResult.imagePath,
                updated_at: new Date().toISOString()
              })
              .eq('id', newArticle.id);

            if (updateError) {
              console.warn('Failed to update article with stored image:', updateError);
            } else {
              console.log('✅ Article updated with stored image');
              imageStored = true;
            }
          } else {
            console.warn('Failed to download and store image:', imageResult.error);
          }
        } catch (imageError) {
          console.warn('Error processing image for article:', imageError);
        }
      }

      // If no image was stored (either no external URL or download failed), try to generate an AI image
      if (!imageStored) {
        console.log('🎨 Generating AI image for article:', truncatedArticle.title);
        try {
          const aiImageUrl = await generateArticleImage(
            truncatedArticle.title, 
            truncatedArticle.summary, 
            truncatedArticle.category,
            newArticle.id,
            supabaseUrl,
            supabaseServiceKey
          );
          
          console.log('🔄 generateArticleImage returned:', aiImageUrl);
          
          if (aiImageUrl) {
            console.log('🖼️ AI image generated and stored successfully:', aiImageUrl);
            
            // Update the article with the AI-generated image URL
            const imagePath = `articles/${newArticle.id}/${aiImageUrl.split('/').pop()}`;
            const imageName = aiImageUrl.split('/').pop();
            
            console.log('📝 Updating article with image data:');
            console.log('  image_url:', aiImageUrl);
            console.log('  image_path:', imagePath);
            console.log('  image_name:', imageName);
            console.log('  article_id:', newArticle.id);
            
            const { error: updateError } = await supabase
              .from('news_articles')
              .update({
                image_url: aiImageUrl,
                image_path: imagePath,
                updated_at: new Date().toISOString()
              })
              .eq('id', newArticle.id);

            if (updateError) {
              console.warn('❌ Failed to update article with AI-generated image:', updateError);
            } else {
              console.log('✅ Article updated with AI-generated image successfully');
            }
          } else {
            console.log('No AI image generated for article:', truncatedArticle.title);
          }
        } catch (aiError) {
          console.warn('Error generating AI image:', aiError);
        }
      }
    }

    return { added: 1, skipped: 0 };
  }
}
