import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Newspaper, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchIndustryNews } from '@/services/industry-news';
import type { IndustryNewsResult, IndustryNewsFetchParams } from '@/services/industry-news';

export const IndustryNewsForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IndustryNewsResult | null>(null);
  const [maxArticles, setMaxArticles] = useState<number>(5);
  const [category, setCategory] = useState<string>('custom');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('day');

  const handleFetchIndustryNews = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Use custom category if provided, otherwise use selected category
      const selectedCategory = customCategory.trim() || (category !== 'all' && category !== 'custom' ? category : undefined);
      
      const params: IndustryNewsFetchParams = {
        maxArticles,
        ...(selectedCategory && { category: selectedCategory as any }),
        ...(timeRange && timeRange !== 'all' && { timeRange: timeRange as any }),
      };

      const resultData = await fetchIndustryNews(params);
      setResult(resultData);
    } catch (error) {
      console.error('Error fetching industry news:', error);
      setResult({
        success: false,
        message: 'Failed to fetch industry news',
        data: {
          articles_added: 0,
          articles_skipped: 0,
          total_processed: 0,
          categories: [],
          sources: [],
        },
        timestamp: new Date().toISOString(),
        source: 'admin-ui',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-600" />
          Industry News Fetcher
        </CardTitle>
        <CardDescription>
          Fetch and categorize industry-wide electric vehicle news, including technology breakthroughs, market trends, and policy updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxArticles">Max Articles</Label>
            <Input
              id="maxArticles"
              type="number"
              min="1"
              max="50"
              value={maxArticles}
              onChange={(e) => setMaxArticles(parseInt(e.target.value) || 5)}
              placeholder="5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeRange">Time Range (Optional)</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="day">Last Day</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="categorySelect" className="text-sm font-medium">Predefined Categories</Label>
                <Select value={category} onValueChange={(value) => {
                  setCategory(value);
                  if (value !== 'custom') {
                    setCustomCategory('');
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Market Trends">Market Trends</SelectItem>
                    <SelectItem value="Policy">Policy</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Startups">Startups</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="custom">Custom Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {category === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customCategory" className="text-sm font-medium">Custom Category</Label>
                  <Input
                    id="customCategory"
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category (e.g., Battery Technology, Charging Networks)"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Enter a specific category to focus the news generation on that topic.
                  </p>
                  {category === 'custom' && !customCategory.trim() && (
                    <p className="text-xs text-amber-600">
                      Please enter a custom category to proceed.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Button 
          onClick={handleFetchIndustryNews} 
          disabled={isLoading || (category === 'custom' && !customCategory.trim())}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching Industry News...
            </>
          ) : (
            <>
              <Newspaper className="mr-2 h-4 w-4" />
              Fetch Industry News
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 space-y-4">
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </AlertDescription>
              </div>
            </Alert>

            {result.success && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.data.articles_added}</div>
                  <div className="text-sm text-blue-800">Articles Added</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{result.data.articles_skipped}</div>
                  <div className="text-sm text-yellow-800">Articles Skipped</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.data.total_processed}</div>
                  <div className="text-sm text-green-800">Total Processed</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{result.data.categories.length}</div>
                  <div className="text-sm text-purple-800">Categories</div>
                </div>
              </div>
            )}

            {result.data.categories.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Categories Found:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.data.categories.map((cat, index) => (
                    <Badge key={index} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.data.sources.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sources:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.data.sources.map((source, index) => (
                    <Badge key={index} variant="outline">{source}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Error: {result.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-500">
              <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
              <p>Source: {result.source}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
