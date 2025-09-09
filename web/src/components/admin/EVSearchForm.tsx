import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, ExternalLink, Car, AlertCircle } from 'lucide-react';
import { EVSearchService } from '@/services/ev-search';
import type { EVSearchResult } from '@/services/ev-search';

export const EVSearchForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    manufacturer: 'Tesla',
    model: '',
    trim: '',
    year: new Date().getFullYear(),
    includeAllTrims: true,
    maxResults: 20
  });
  const [searchResult, setSearchResult] = useState<EVSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      // Validate parameters
      const validation = EVSearchService.validateParams(searchParams);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      const result = await EVSearchService.searchEVs(searchParams);
      setSearchResult(result);
      
      if (!result.success) {
        setError(result.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof searchParams, value: string | number | boolean) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search for Electric Vehicles
          </CardTitle>
          <CardDescription>
            Use Gemini AI to research and compile comprehensive lists of electric vehicles for specific manufacturers and models, then compare with the database to find missing vehicles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                value={searchParams.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="Tesla, Ford, BMW..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model (Optional)</Label>
              <Input
                id="model"
                value={searchParams.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Model 3, F-150 Lightning... (leave empty for all models)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trim">Trim (Optional)</Label>
              <Input
                id="trim"
                value={searchParams.trim}
                onChange={(e) => handleInputChange('trim', e.target.value)}
                placeholder="Long Range, Performance..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2030"
                value={searchParams.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxResults">Max Results</Label>
              <Input
                id="maxResults"
                type="number"
                min="1"
                max="50"
                value={searchParams.maxResults}
                onChange={(e) => handleInputChange('maxResults', parseInt(e.target.value) || 20)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="includeAllTrims" className="flex items-center space-x-2">
                <input
                  id="includeAllTrims"
                  type="checkbox"
                  checked={searchParams.includeAllTrims}
                  onChange={(e) => handleInputChange('includeAllTrims', e.target.checked)}
                  className="rounded"
                />
                <span>Include All Trims</span>
              </Label>
            </div>
          </div>
          
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching with Gemini AI...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Research EVs with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-green-600" />
              Search Results
            </CardTitle>
            <CardDescription>
              {searchResult.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{searchResult.totalSearched}</div>
                <div className="text-sm text-gray-600">Total Found</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{searchResult.missingVehicles.length}</div>
                <div className="text-sm text-gray-600">Missing from DB</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{searchResult.foundVehicles.length - searchResult.missingVehicles.length}</div>
                <div className="text-sm text-gray-600">Already in DB</div>
              </div>
            </div>

            {searchResult.missingVehicles.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Missing Vehicles</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Trim</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResult.missingVehicles.map((vehicle, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">
                              {capitalizeFirst(vehicle.manufacturer)} {capitalizeFirst(vehicle.model)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.trim ? (
                              <Badge variant="secondary">
                                {capitalizeFirst(vehicle.trim)}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle.year || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {vehicle.source}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {vehicle.url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(vehicle.url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All found vehicles are already in the database. No missing vehicles detected.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
