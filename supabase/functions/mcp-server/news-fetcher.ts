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
      const articleResult = await processNewsArticle(article, supabase);
      counters.articles_added += articleResult.added;
      counters.articles_skipped += articleResult.skipped;
      counters.total_processed += 1;
      
      // Track unique categories and sources
      if (!counters.categories.includes(article.category)) {
        counters.categories.push(article.category);
      }
      if (!counters.sources.includes(article.source_name)) {
        counters.sources.push(article.source_name);
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
      const articleResult = await processNewsArticle(article, supabase);
      counters.articles_added += articleResult.added;
      counters.articles_skipped += articleResult.skipped;
      counters.total_processed += 1;
      
      // Track unique categories and sources
      if (!counters.categories.includes(article.category)) {
        counters.categories.push(article.category);
      }
      if (!counters.sources.includes(article.source_name)) {
        counters.sources.push(article.source_name);
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

// Search for industry news articles
async function searchIndustryNews(params: IndustryNewsFetchParams): Promise<NewsArticle[]> {
  console.log('🔍 Searching for industry news articles for:', params);
  
  // Build industry-focused search queries
  const industrySearchQueries = [
    'electric vehicle industry news 2024',
    'EV market trends 2024',
    'electric car technology breakthroughs',
    'EV charging infrastructure news',
    'electric vehicle policy regulations',
    'battery technology electric vehicles',
    'EV sales statistics 2024',
    'electric vehicle startups funding',
    'autonomous electric vehicles',
    'EV manufacturing news'
  ];

  // Add category-specific queries if specified
  if (params.category) {
    const categoryQueries = {
      'technology': [
        'electric vehicle battery technology 2024',
        'EV charging technology advances',
        'electric vehicle software updates'
      ],
      'market': [
        'electric vehicle sales data 2024',
        'EV market share statistics',
        'electric car price trends'
      ],
      'policy': [
        'electric vehicle government incentives',
        'EV emissions regulations',
        'electric car policy changes'
      ],
      'infrastructure': [
        'EV charging station expansion',
        'electric vehicle charging networks',
        'EV infrastructure investment'
      ]
    };
    
    if (categoryQueries[params.category as keyof typeof categoryQueries]) {
      industrySearchQueries.push(...categoryQueries[params.category as keyof typeof categoryQueries]);
    }
  }

  // Execute searches
  const newsSearchResults = await Promise.all(
    industrySearchQueries.map(query => callGoogleSearchAPI({ 
      query, 
      num_results: Math.ceil((params.maxArticles || 20) / industrySearchQueries.length)
    }))
  );

  // Process search results to extract news articles
  const newsArticles = await processSearchResultsForIndustryNews(
    newsSearchResults,
    params
  );

  return newsArticles;
}

// Search for vehicle news articles
async function searchVehicleNews(params: NewsFetchParams): Promise<NewsArticle[]> {
  console.log('🔍 Searching for news articles for:', params);
  
  // Determine the target year
  const currentYear = new Date().getFullYear();
  const targetYear = params.year || currentYear;
  
  // Search for news articles
  const newsSearchQueries = [
    `${params.manufacturer} ${params.model} ${targetYear} news`,
    `${params.manufacturer} ${params.model} ${targetYear} review`,
    `${params.manufacturer} ${params.model} ${targetYear} update`,
    `${params.manufacturer} ${params.model} ${targetYear} price change`,
    `${params.manufacturer} ${params.model} ${targetYear} launch`,
    `${params.manufacturer} ${params.model} ${targetYear} announcement`
  ];

  // Execute searches
  const newsSearchResults = await Promise.all(
    newsSearchQueries.map(query => callGoogleSearchAPI({ 
      query, 
      num_results: Math.ceil((params.maxArticles || 20) / newsSearchQueries.length)
    }))
  );

  // Process search results to extract news articles
  const newsArticles = await processSearchResultsForNews(
    newsSearchResults,
    params,
    targetYear
  );

  return newsArticles;
}

// Process search results to extract structured industry news data using Gemini
async function processSearchResultsForIndustryNews(
  newsSearchResults: GoogleSearchResponse[],
  params: IndustryNewsFetchParams
): Promise<NewsArticle[]> {
  console.log('📊 Processing search results for industry news data using Gemini...');

  // Combine all search results
  const allNewsItems = newsSearchResults.flatMap(response => response.items || []);
  
  if (allNewsItems.length === 0) {
    console.log('No industry news items found in search results');
    return [];
  }

  // Limit search results and truncate long snippets to stay within prompt limits
  const maxResults = params.maxArticles || 20;
  const maxSnippetLength = 200; // Truncate snippets to 200 characters
  
  const limitedNewsItems = allNewsItems.slice(0, maxResults);
  console.log('🔍 Limited industry news items:', limitedNewsItems.length);
  
  const newsText = limitedNewsItems
    .map(item => {
      const truncatedSnippet = item.snippet && item.snippet.length > maxSnippetLength 
        ? item.snippet.substring(0, maxSnippetLength) + '...'
        : item.snippet;
      return `Title: ${item.title}\nSnippet: ${truncatedSnippet}\nURL: ${item.link}\nSource: ${item.displayLink}\n---`;
    })
    .join('\n');

  // Use Gemini to extract and categorize industry news articles
  const newsArticlesData = await extractIndustryNewsArticlesData(params, newsText);

  return newsArticlesData;
}

// Process search results to extract structured news data using Gemini
async function processSearchResultsForNews(
  newsSearchResults: GoogleSearchResponse[],
  params: NewsFetchParams,
  targetYear: number
): Promise<NewsArticle[]> {
  console.log('📊 Processing search results for news data using Gemini...');

  // Combine all search results
  const allNewsItems = newsSearchResults.flatMap(response => response.items || []);
  
  if (allNewsItems.length === 0) {
    console.log('No news items found in search results');
    return [];
  }

  // Limit search results and truncate long snippets to stay within prompt limits
  const maxResults = params.maxArticles || 20;
  const maxSnippetLength = 200; // Truncate snippets to 200 characters
  
  const limitedNewsItems = allNewsItems.slice(0, maxResults);
  console.log('🔍 Limited news items:', limitedNewsItems.length);
  
  const newsText = limitedNewsItems
    .map(item => {
      const truncatedSnippet = item.snippet && item.snippet.length > maxSnippetLength 
        ? item.snippet.substring(0, maxSnippetLength) + '...'
        : item.snippet;
      return `Title: ${item.title}\nSnippet: ${truncatedSnippet}\nURL: ${item.link}\nSource: ${item.displayLink}\n---`;
    })
    .join('\n');

  // Use Gemini to extract and categorize news articles
  const newsArticlesData = await extractNewsArticlesData(params, newsText, targetYear);

  return newsArticlesData;
}

// Extract industry news articles data using Gemini
async function extractIndustryNewsArticlesData(params: IndustryNewsFetchParams, newsText: string): Promise<NewsArticle[]> {
  const prompt = `Analyze the following industry news articles about electric vehicles and extract structured information.

Industry News Articles:
${newsText}

Please extract and return ONLY a JSON array with article objects. Each article should have the following structure:
{
  "title": "Article title",
  "summary": "Brief summary of the article",
  "source_url": "Article URL",
  "source_name": "Source website name",
  "category": "Category (Technology, Market Trends, Policy, Infrastructure, Manufacturing, Startups, Investment, Safety, Performance, General)",
  "tags": ["array", "of", "relevant", "tags"],
  "published_date": "YYYY-MM-DD format"
}

Categorize each article appropriately for the electric vehicle industry and extract relevant tags. If published date is not available, use today's date. Limit to the ${params.maxArticles || 20} most relevant articles.`;

  const response = await callGeminiAPI({
    task: 'analyze_industry_news_data',
    prompt,
    expectedOutput: 'JSON array of industry news article objects',
    temperature: 0.3
  });

  try {
    // Clean the response text to extract JSON
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
    
    console.log('Parsing industry news articles data:', responseText);
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data.slice(0, params.maxArticles || 20) : [data];
  } catch (error) {
    console.warn('Failed to parse industry news articles data from Gemini:', error);
    console.warn('Raw response:', response.text);
    
    // Fallback: create basic article objects from search results
    const fallbackArticles: NewsArticle[] = [];
    const newsItems = newsText.split('---').slice(0, params.maxArticles || 20);
    
    for (const item of newsItems) {
      if (item.trim()) {
        const lines = item.trim().split('\n');
        const title = lines.find(l => l.startsWith('Title:'))?.replace('Title:', '').trim() || 'Untitled';
        const snippet = lines.find(l => l.startsWith('Snippet:'))?.replace('Snippet:', '').trim() || '';
        const url = lines.find(l => l.startsWith('URL:'))?.replace('URL:', '').trim() || '';
        const source = lines.find(l => l.startsWith('Source:'))?.replace('Source:', '').trim() || 'Unknown';
        
        fallbackArticles.push({
          title,
          summary: snippet,
          source_url: url,
          source_name: source,
          category: 'General',
          tags: ['electric vehicles', 'industry news'],
          published_date: new Date().toISOString().split('T')[0]
        });
      }
    }
    
    return fallbackArticles;
  }
}

// Extract news articles data using Gemini
async function extractNewsArticlesData(params: NewsFetchParams, newsText: string, targetYear: number): Promise<NewsArticle[]> {
  const prompt = `Analyze the following news articles about ${params.manufacturer} ${params.model} ${targetYear} and extract structured information.

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

Categorize each article appropriately and extract relevant tags. If published date is not available, use today's date. Limit to the ${params.maxArticles || 20} most relevant articles.`;

  const response = await callGeminiAPI({
    task: 'analyze_news_data',
    prompt,
    expectedOutput: 'JSON array of news article objects',
    temperature: 0.3
  });

  try {
    // Clean the response text to extract JSON
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
    
    console.log('Parsing news articles data:', responseText);
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data.slice(0, params.maxArticles || 20) : [data];
  } catch (error) {
    console.warn('Failed to parse news articles data from Gemini:', error);
    console.warn('Raw response:', response.text);
    
    // Fallback: create basic article objects from search results
    const fallbackArticles: NewsArticle[] = [];
    const newsItems = newsText.split('---').slice(0, params.maxArticles || 20);
    
    for (const item of newsItems) {
      if (item.trim()) {
        const lines = item.trim().split('\n');
        const title = lines.find(l => l.startsWith('Title:'))?.replace('Title:', '').trim() || 'Untitled';
        const snippet = lines.find(l => l.startsWith('Snippet:'))?.replace('Snippet:', '').trim() || '';
        const url = lines.find(l => l.startsWith('URL:'))?.replace('URL:', '').trim() || '';
        const source = lines.find(l => l.startsWith('Source:'))?.replace('Source:', '').trim() || 'Unknown';
        
        fallbackArticles.push({
          title,
          summary: snippet,
          source_url: url,
          source_name: source,
          category: 'General',
          tags: [params.manufacturer, params.model],
          published_date: new Date().toISOString().split('T')[0]
        });
      }
    }
    
    return fallbackArticles;
  }
}

// Process individual news article in database
async function processNewsArticle(article: NewsArticle, supabase: any) {
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
