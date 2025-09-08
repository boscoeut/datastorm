import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VehicleUpdateService, type VehicleUpdateParams, type VehicleUpdateResult } from '@/services/vehicle-update';
import { Loader2, Car, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export const VehicleUpdateForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<VehicleUpdateParams>>({
    manufacturer: '',
    model: '',
    trim: '',
    year: new Date().getFullYear()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VehicleUpdateResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof VehicleUpdateParams, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear previous errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = VehicleUpdateService.validateParams(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setResult(null);
    setErrors([]);

    try {
      const updateResult = await VehicleUpdateService.updateVehicleDetails(formData as VehicleUpdateParams);
      setResult(updateResult);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setErrors([error instanceof Error ? error.message : 'An unexpected error occurred']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      manufacturer: '',
      model: '',
      trim: '',
      year: new Date().getFullYear()
    });
    setResult(null);
    setErrors([]);
  };

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Update Vehicle Details
          </CardTitle>
          <CardDescription>
            Use AI-powered research to update vehicle information in the database. 
            This will search for current specifications, news, and details about the vehicle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  type="text"
                  placeholder="e.g., Tesla, Ford, BMW"
                  value={formData.manufacturer || ''}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  type="text"
                  placeholder="e.g., Model 3, F-150, X5"
                  value={formData.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trim">Trim (Optional)</Label>
                <Input
                  id="trim"
                  type="text"
                  placeholder="e.g., Performance, Long Range, Base"
                  value={formData.trim || ''}
                  onChange={(e) => handleInputChange('trim', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 2}
                  value={formData.year || ''}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                  disabled={isLoading}
                />
              </div>
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Vehicle...
                  </>
                ) : (
                  <>
                    <Car className="h-4 w-4" />
                    Update Vehicle
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${getStatusColor(result.success)}`}>
              {getStatusIcon(result.success)}
              Update Result
            </CardTitle>
            <CardDescription>
              {result.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Vehicle details have been successfully updated using AI-powered research.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.data.manufacturer_created + result.data.manufacturer_updated}
                    </div>
                    <div className="text-sm text-gray-600">Manufacturers</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.data.vehicles_created + result.data.vehicles_updated}
                    </div>
                    <div className="text-sm text-gray-600">Vehicles</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.data.specifications_created + result.data.specifications_updated}
                    </div>
                    <div className="text-sm text-gray-600">Specifications</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.data.news_articles_added}
                    </div>
                    <div className="text-sm text-gray-600">News Articles</div>
                  </div>
                </div>

                {result.data.trims_processed.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Trims Processed:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.data.trims_processed.map((trim, index) => (
                        <Badge key={index} variant="secondary">{trim}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />
                
                <div className="text-sm text-gray-600">
                  <div>Processed: {result.data.model_year_processed}</div>
                  <div>Timestamp: {new Date(result.timestamp).toLocaleString()}</div>
                  <div>Source: {result.source}</div>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>{result.message}</div>
                    {result.error && (
                      <div className="text-sm">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
