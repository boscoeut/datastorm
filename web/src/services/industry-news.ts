import { supabase } from '@/lib/supabase';

export interface IndustryNewsFetchParams {
  maxArticles?: number;
  category?: 'technology' | 'market' | 'policy' | 'infrastructure';
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

export interface IndustryNewsResult {
  success: boolean;
  message: string;
  data: {
    articles_added: number;
    articles_skipped: number;
    total_processed: number;
    categories: string[];
    sources: string[];
  };
  timestamp: string;
  source: string;
  error?: string;
}

export const fetchIndustryNews = async (params: IndustryNewsFetchParams): Promise<IndustryNewsResult> => {
  try {
    console.log('📰 Calling MCP server to fetch industry news:', params);

    // Call the MCP server edge function using JSON-RPC format
    const { data, error } = await supabase.functions.invoke('mcp-server', {
      body: {
        jsonrpc: '2.0',
        id: Date.now().toString(),
        method: 'tools/call',
        params: {
          name: 'fetch-industry-news',
          arguments: params,
        },
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Supabase function error: ${error.message}`);
    }

    if (data?.result) {
      return JSON.parse(data.result.content[0].text);
    } else if (data?.error) {
      throw new Error(data.error.message || 'Unknown error');
    } else {
      throw new Error('No result or error returned from MCP server');
    }
  } catch (error) {
    console.error('Error fetching industry news:', error);
    throw error;
  }
};

export const getIndustryNewsArticles = async (limit: number = 50, offset: number = 0) => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching industry news articles:', error);
    throw error;
  }
};
