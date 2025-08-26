import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Car, 
  Zap, 
  Gauge, 
  Battery, 
  TrendingUp, 
  Star,
  Shuffle,
  Database,
  Clock,
  ExternalLink,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { useVehicleStore, useVehicles, useVehicleLoading } from '@/stores/vehicle-store';
import { VehicleService } from '@/services/database';
import { NewsArticleService } from '@/services/database';
import type { Vehicle, VehicleWithDetails, NewsArticle } from '@/types/database';

const LandingPage = () => {
  // Vehicle selection state
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  
  // News state
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  
  // Navigation
  const navigate = useNavigate();
  
  // Store hooks
  const vehicles = useVehicles();
  const vehicleLoading = useVehicleLoading();
  const { fetchVehicles } = useVehicleStore();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchVehicles();
    fetchRecentNews();
  }, [fetchVehicles]);
  
  // Randomly select a vehicle on page load after vehicles are fetched
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      handleRandomSelect();
    }
  }, [vehicles, selectedVehicle]);
  
  // Fetch recent news articles
  const fetchRecentNews = async () => {
    setNewsLoading(true);
    try {
      const result = await NewsArticleService.getLatest(6);
      if (result.data) {
        setRecentNews(result.data);
      }
    } catch (error) {
      console.error('Error fetching recent news:', error);
    } finally {
      setNewsLoading(false);
    }
  };
  
  // Handle vehicle selection from dropdown
  const handleVehicleSelect = async (vehicleId: string) => {
    if (!vehicleId) return;
    
    setSelectedVehicleId(vehicleId);
    try {
      const result = await VehicleService.getWithDetails(vehicleId);
      if (result.data) {
        setSelectedVehicle(result.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  };
  
  // Randomly select a vehicle
  const handleRandomSelect = () => {
    if (vehicles.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * vehicles.length);
    const randomVehicle = vehicles[randomIndex];
    handleVehicleSelect(randomVehicle.id);
  };
  
  // Format specifications for display
  const formatSpec = (value: number | undefined, unit: string) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value} ${unit}`;
  };
  
  // Get vehicle image placeholder
  const getVehicleImage = (vehicle: Vehicle) => {
    const brand = vehicle.manufacturer?.name?.toLowerCase() || 'car';
    const model = vehicle.model.toLowerCase();
    
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
    const colorIndex = (brand.length + model.length) % colors.length;
    
    return (
      <div 
        className="w-full h-48 bg-gradient-to-br rounded-lg flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${colors[colorIndex]}20, ${colors[colorIndex]}40)`,
          border: `2px solid ${colors[colorIndex]}30`
        }}
      >
        <Car className="w-24 h-24 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
          Electric Vehicle Data Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore comprehensive data on electric vehicles and their specifications.
        </p>
        
        {/* Vehicle Selection Interface */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle-select" className="text-sm font-medium">
              Select a Vehicle
            </Label>
            <select
              id="vehicle-select"
              value={selectedVehicleId}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Choose a vehicle...</option>
              {vehicles
                .sort((a, b) => {
                  // First sort by manufacturer name
                  const manufacturerA = a.manufacturer?.name || '';
                  const manufacturerB = b.manufacturer?.name || '';
                  if (manufacturerA !== manufacturerB) {
                    return manufacturerA.localeCompare(manufacturerB);
                  }
                  // If same manufacturer, sort by model name
                  return a.model.localeCompare(b.model);
                })
                .map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.manufacturer?.name} {vehicle.model} ({vehicle.year})
                  </option>
                ))}
            </select>
          </div>
          
          <Button 
            onClick={handleRandomSelect}
            className="w-full"
            disabled={vehicles.length === 0 || vehicleLoading}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Select Random Vehicle
          </Button>
        </div>

        {/* Navigate to Vehicle Database Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/vehicles')}
          disabled={vehicleLoading}
        >
          <Database className="mr-2 h-4 w-4" />
          View All Vehicles
        </Button>
      </div>

      {/* Selected Vehicle Display */}
      {selectedVehicle && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {selectedVehicle.manufacturer?.name} {selectedVehicle.model}
            </h2>
            <p className="text-lg text-muted-foreground">
              {selectedVehicle.year} • {selectedVehicle.body_style || 'Vehicle'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Image and Basic Info */}
            <Card className="overflow-hidden">
              {getVehicleImage(selectedVehicle)}
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      {selectedVehicle.is_electric ? 'Electric' : 'Hybrid'}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">Featured Vehicle</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatSpec(selectedVehicle.specifications?.range_miles, 'mi')}
                      </div>
                      <div className="text-sm text-muted-foreground">Range</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatSpec(selectedVehicle.specifications?.power_hp, 'hp')}
                      </div>
                      <div className="text-sm text-muted-foreground">Power</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Vehicle Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Battery Capacity</Label>
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-green-500" />
                      <span className="font-medium">
                        {formatSpec(selectedVehicle.specifications?.battery_capacity_kwh, 'kWh')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">0-60 mph</Label>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        {formatSpec(selectedVehicle.specifications?.acceleration_0_60, 's')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Top Speed</Label>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="font-medium">
                        {formatSpec(selectedVehicle.specifications?.top_speed_mph, 'mph')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Weight</Label>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {formatSpec(selectedVehicle.specifications?.weight_lbs, 'lbs')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Recent News Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <TrendingUpIcon className="h-8 w-8" />
            Latest Industry News
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Stay updated with the latest developments in electric vehicles and sustainable transportation
          </CardDescription>
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/news')}
              className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
            >
              View All News Articles
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {newsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <span className="text-muted-foreground text-lg">Loading latest news...</span>
            </div>
          ) : recentNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNews.map((article, index) => (
                <Card 
                  key={article.id} 
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm cursor-pointer"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                  onClick={() => {
                    if (article.source_url) {
                      window.open(article.source_url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Article Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <Badge 
                          variant="secondary" 
                          className="mb-2 text-xs font-medium px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900 dark:text-blue-200"
                        >
                          {article.category || 'News'}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {article.published_date 
                              ? new Date(article.published_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'Recent'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Article Title */}
                    <h3 className="font-bold text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    {/* Article Summary */}
                    {article.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    )}
                    
                    {/* Article Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-medium text-muted-foreground">
                        {article.source_name || 'Source'}
                      </span>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <span>Click to read</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                <TrendingUpIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Recent News</h3>
              <p className="text-sm text-muted-foreground">Check back later for the latest updates</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPage;
