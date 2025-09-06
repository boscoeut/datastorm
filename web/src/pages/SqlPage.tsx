import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { SqlService } from '../services/sql';
import type { SqlQueryResult } from '../services/sql';

interface QueryHistory {
  query: string;
  result: SqlQueryResult;
  timestamp: Date;
}

const SqlPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const executeQuery = useCallback(async () => {
    if (!query.trim()) {
      setResult({
        success: false,
        error: 'Please enter a SQL query'
      });
      return;
    }

    setIsLoading(true);
    try {
      const queryResult = await SqlService.executeQuery(query);
      setResult(queryResult);
      
      // Add to history
      const historyItem: QueryHistory = {
        query: query.trim(),
        result: queryResult,
        timestamp: new Date()
      };
      setQueryHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 queries
    } catch (error) {
      setResult({
        success: false,
        error: `Error executing query: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      executeQuery();
    }
  };

  const loadHistoryQuery = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
  };

  const clearQuery = () => {
    setQuery('');
    setResult(null);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SQL Query Executor</h1>
        <p className="text-muted-foreground">
          Execute SQL queries against the database. Only SELECT, WITH, EXPLAIN, DESCRIBE, and SHOW operations are allowed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Input */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SQL Query</CardTitle>
                  <CardDescription>
                    Enter your SQL query below. Use Ctrl+Enter (Cmd+Enter on Mac) to execute.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    History ({queryHistory.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearQuery}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="SELECT * FROM vehicles LIMIT 10;"
                  className="w-full h-64 p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {query.length} characters
                  </div>
                  <Button 
                    onClick={executeQuery} 
                    disabled={isLoading || !query.trim()}
                    className="min-w-24"
                  >
                    {isLoading ? 'Executing...' : 'Execute'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Query History */}
          {showHistory && queryHistory.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Query History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {queryHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => loadHistoryQuery(item.query)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={item.result.success ? "default" : "destructive"}>
                          {item.result.success ? 'Success' : 'Error'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <code className="text-sm text-muted-foreground line-clamp-2">
                        {item.query}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Query execution results and metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

              {!isLoading && result && (
                <div className="space-y-4">
                  {/* Result Summary */}
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? 'Success' : 'Error'}
                    </Badge>
                    {result.executionTime && (
                      <span className="text-sm text-muted-foreground">
                        {result.executionTime}ms
                      </span>
                    )}
                    {result.rowCount !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {result.rowCount} rows
                      </span>
                    )}
                  </div>

                  {/* Error Message */}
                  {!result.success && result.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800 font-mono">
                        {result.error}
                      </p>
                    </div>
                  )}

                  {/* Success Results */}
                  {result.success && result.data && (
                    <div className="space-y-3">
                      {result.data.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No results returned
                        </p>
                      ) : (
                        <div className="max-h-96 overflow-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b">
                                {result.columns?.map((column, index) => (
                                  <th key={index} className="text-left p-2 font-medium bg-muted/50">
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {result.data.slice(0, 100).map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b hover:bg-muted/30">
                                  {result.columns?.map((column, colIndex) => (
                                    <td key={colIndex} className="p-2 font-mono">
                                      {formatValue(row[column])}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {result.data.length > 100 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Showing first 100 rows of {result.data.length} total
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !result && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No query executed yet</p>
                  <p className="text-sm mt-1">Enter a query and click Execute</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Examples */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Quick Examples</CardTitle>
          <CardDescription>
            Click on any example to load it into the query editor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "List Tables",
                query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
              },
              {
                title: "Show Vehicles",
                query: "SELECT * FROM vehicles LIMIT 10;"
              },
              {
                title: "Count Records",
                query: "SELECT COUNT(*) as total_records FROM vehicles;"
              },
              {
                title: "Table Schema",
                query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vehicles' ORDER BY ordinal_position;"
              },
              {
                title: "Recent News",
                query: "SELECT title, published_at FROM news ORDER BY published_at DESC LIMIT 5;"
              },
              {
                title: "Database Info",
                query: "SELECT version();"
              }
            ].map((example, index) => (
              <div
                key={index}
                className="p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setQuery(example.query)}
              >
                <h4 className="font-medium mb-1">{example.title}</h4>
                <code className="text-xs text-muted-foreground line-clamp-2">
                  {example.query}
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SqlPage;
