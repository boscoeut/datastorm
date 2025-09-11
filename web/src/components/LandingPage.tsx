import { useState, useEffect } from 'react';
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
  Shuffle,
  Database,
  Clock,
  ExternalLink,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVehicleStore, useVehicles, useVehicleLoading } from '@/stores/vehicle-store';
import { VehicleService } from '@/services/database';
import { NewsArticleService } from '@/services/database';
import { NewsImageService } from '@/services/news-image-storage';
import type { VehicleWithDetails, NewsArticle } from '@/types/database';

const LandingPage = () => {
  // Vehicle selection state - now supporting two vehicles
  const [selectedVehicle1, setSelectedVehicle1] = useState<VehicleWithDetails | null>(null);
  const [selectedVehicle2, setSelectedVehicle2] = useState<VehicleWithDetails | null>(null);
  const [selectedVehicle1Id, setSelectedVehicle1Id] = useState<string>('');
  const [selectedVehicle2Id, setSelectedVehicle2Id] = useState<string>('');
  
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
  
  // Randomly select two vehicles on page load after vehicles are fetched
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle1 && !selectedVehicle2) {
      handleRandomSelect();
    }
  }, [vehicles, selectedVehicle1, selectedVehicle2]);
  
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
  const handleVehicleSelect = async (vehicleId: string, position: 1 | 2) => {
    if (!vehicleId) return;
    
    if (position === 1) {
      setSelectedVehicle1Id(vehicleId);
    } else {
      setSelectedVehicle2Id(vehicleId);
    }
    
    try {
      const result = await VehicleService.getWithDetails(vehicleId);
      if (result.data) {
        if (position === 1) {
          setSelectedVehicle1(result.data);
        } else {
          setSelectedVehicle2(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  };
  
  // Randomly select two vehicles
  const handleRandomSelect = () => {
    if (vehicles.length === 0) return;
    
    // Select two different random vehicles
    let randomIndex1 = Math.floor(Math.random() * vehicles.length);
    let randomIndex2 = Math.floor(Math.random() * vehicles.length);
    
    // Ensure they're different vehicles
    while (randomIndex2 === randomIndex1 && vehicles.length > 1) {
      randomIndex2 = Math.floor(Math.random() * vehicles.length);
    }
    
    const randomVehicle1 = vehicles[randomIndex1];
    const randomVehicle2 = vehicles[randomIndex2];
    
    handleVehicleSelect(randomVehicle1.id, 1);
    handleVehicleSelect(randomVehicle2.id, 2);
  };
  
  // Format specifications for display
  const formatSpec = (value: number | undefined, unit: string) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value} ${unit}`;
  };
  
  // Compare two values and return which is better
  const compareValues = (value1: number | null | undefined, value2: number | null | undefined, higherIsBetter: boolean = true) => {
    if (value1 === null || value1 === undefined || value2 === null || value2 === undefined) {
      return 'equal'
    }
    
    if (value1 === value2) return 'equal'
    
    const isBetter = higherIsBetter ? value1 > value2 : value1 < value2
    return isBetter ? 'better' : 'worse'
  }

  // Get background color for a table cell based on comparison
  const getTableCellBackground = (value1: number | null | undefined, value2: number | null | undefined, higherIsBetter: boolean = true) => {
    const comparison = compareValues(value1, value2, higherIsBetter)
    
    switch (comparison) {
      case 'better':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
      case 'worse':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
      case 'equal':
        return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
      default:
        return ''
    }
  }
  

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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle 1 Selection */}
          <div className="space-y-2">
              <Label htmlFor="vehicle1-select" className="text-sm font-medium">
                Select Vehicle 1
            </Label>
            <select
                id="vehicle1-select"
                value={selectedVehicle1Id}
                onChange={(e) => handleVehicleSelect(e.target.value, 1)}
                className="w-full px-3 py-3 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
              >
                <option value="">Choose vehicle 1...</option>
              {vehicles
                .sort((a, b) => {
                  const manufacturerA = a.manufacturer?.name || '';
                  const manufacturerB = b.manufacturer?.name || '';
                  if (manufacturerA !== manufacturerB) {
                    return manufacturerA.localeCompare(manufacturerB);
                  }
                  return a.model.localeCompare(b.model);
                })
                .map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.manufacturer?.name} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}
                  </option>
                ))}
            </select>
          </div>
          
            {/* Vehicle 2 Selection */}
            <div className="space-y-2">
              <Label htmlFor="vehicle2-select" className="text-sm font-medium">
                Select Vehicle 2
              </Label>
              <select
                id="vehicle2-select"
                value={selectedVehicle2Id}
                onChange={(e) => handleVehicleSelect(e.target.value, 2)}
                className="w-full px-3 py-3 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
              >
                <option value="">Choose vehicle 2...</option>
                {vehicles
                  .sort((a, b) => {
                    const manufacturerA = a.manufacturer?.name || '';
                    const manufacturerB = b.manufacturer?.name || '';
                    if (manufacturerA !== manufacturerB) {
                      return manufacturerA.localeCompare(manufacturerB);
                    }
                    return a.model.localeCompare(b.model);
                  })
                  .map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.manufacturer?.name} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleRandomSelect}
              size="lg"
              className="w-full sm:w-auto px-8 py-3"
            disabled={vehicles.length === 0 || vehicleLoading}
          >
              <Shuffle className="mr-2 h-5 w-5" />
              Select Two Random Vehicles
          </Button>
        <Button
          variant="outline"
              size="lg"
          onClick={() => navigate('/vehicles')}
          disabled={vehicleLoading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
              <Database className="mr-3 h-5 w-5" />
              <span className="font-semibold">View All Vehicles</span>
        </Button>
          </div>
                    </div>
                  </div>
                  
      {/* Selected Vehicles Display */}
      {(selectedVehicle1 || selectedVehicle2) && (
        <div className="space-y-4 mt-6">
          {/* Vehicle Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                Vehicle Comparison
                </CardTitle>
              </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold text-muted-foreground w-48">
                        </th>
                        {selectedVehicle1 && (
                          <th className="text-center p-3 font-semibold w-1/2">
                            <div className="flex flex-col items-center gap-3">
                              <Link 
                                to={`/vehicles/${selectedVehicle1.id}`}
                                className="block w-56 h-56 rounded-lg overflow-hidden border-2 border-blue-500 bg-gray-100 dark:bg-gray-800 hover:border-blue-600 dark:hover:border-blue-400 transition-colors cursor-pointer"
                              >
                                {selectedVehicle1.profile_image_url ? (
                                  <img 
                                    src={selectedVehicle1.profile_image_url} 
                                    alt={`${selectedVehicle1.manufacturer?.name} ${selectedVehicle1.model}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center text-blue-500 ${selectedVehicle1.profile_image_url ? 'hidden' : ''}`}>
                                  <Car className="h-24 w-24" />
                                </div>
                              </Link>
                              <div className="text-center">
                                <Link 
                                  to={`/vehicles/${selectedVehicle1.id}`}
                                  className="font-medium text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1 transition-colors"
                                >
                                  {selectedVehicle1.manufacturer?.name} {selectedVehicle1.model}
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                                {selectedVehicle1.trim && (
                                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {selectedVehicle1.trim}
                                  </div>
                                )}
                                <div className="text-sm text-muted-foreground">
                                  {selectedVehicle1.body_style || 'Vehicle'}
                                </div>
                              </div>
                            </div>
                          </th>
                        )}
                        {selectedVehicle2 && (
                          <th className="text-center p-3 font-semibold w-1/2">
                            <div className="flex flex-col items-center gap-3">
                              <Link 
                                to={`/vehicles/${selectedVehicle2.id}`}
                                className="block w-56 h-56 rounded-lg overflow-hidden border-2 border-red-500 bg-gray-100 dark:bg-gray-800 hover:border-red-600 dark:hover:border-red-400 transition-colors cursor-pointer"
                              >
                                {selectedVehicle2.profile_image_url ? (
                                  <img 
                                    src={selectedVehicle2.profile_image_url} 
                                    alt={`${selectedVehicle2.manufacturer?.name} ${selectedVehicle2.model}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center text-red-500 ${selectedVehicle2.profile_image_url ? 'hidden' : ''}`}>
                                  <Car className="h-24 w-24" />
                                </div>
                              </Link>
                              <div className="text-center">
                                <Link 
                                  to={`/vehicles/${selectedVehicle2.id}`}
                                  className="font-medium text-base text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center justify-center gap-1 transition-colors"
                                >
                                  {selectedVehicle2.manufacturer?.name} {selectedVehicle2.model}
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                                {selectedVehicle2.trim && (
                                  <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                    {selectedVehicle2.trim}
                                  </div>
                                )}
                                <div className="text-sm text-muted-foreground">
                                  {selectedVehicle2.body_style || 'Vehicle'}
                                </div>
                              </div>
                            </div>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Range, Power, and MSRP - Combined in single row */}
                      <tr className="border-b border-border/50">
                        <td className="p-3 font-medium text-sm w-48"></td>
                        {selectedVehicle1 && (
                          <td className="p-3 text-center w-1/2">
                    <div className="space-y-2">
                              <div className={`text-center p-2 rounded-lg border-2 ${selectedVehicle2 ? getTableCellBackground(selectedVehicle2.specifications?.msrp_usd, selectedVehicle1.specifications?.msrp_usd, false) : 'bg-muted/50'}`}>
                                <div className="text-xl font-bold text-primary">
                                  {selectedVehicle1.specifications?.msrp_usd ? `$${selectedVehicle1.specifications.msrp_usd.toLocaleString()}` : 'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground">MSRP</div>
                              </div>
                              <div className={`text-center p-2 rounded-lg border-2 ${selectedVehicle2 ? getTableCellBackground(selectedVehicle1.specifications?.range_miles, selectedVehicle2.specifications?.range_miles, true) : 'bg-muted/50'}`}>
                                <div className="text-xl font-bold text-primary">
                                  {formatSpec(selectedVehicle1.specifications?.range_miles, 'mi')}
                                </div>
                                <div className="text-xs text-muted-foreground">Range</div>
                              </div>
                              <div className={`text-center p-2 rounded-lg border-2 ${selectedVehicle2 ? getTableCellBackground(selectedVehicle1.specifications?.power_hp, selectedVehicle2.specifications?.power_hp, true) : 'bg-muted/50'}`}>
                                <div className="text-xl font-bold text-primary">
                                  {formatSpec(selectedVehicle1.specifications?.power_hp, 'hp')}
                                </div>
                                <div className="text-xs text-muted-foreground">Power</div>
                      </div>
                    </div>
                          </td>
                        )}
                        {selectedVehicle2 && (
                          <td className="p-3 text-center w-1/2">
                    <div className="space-y-2">
                              <div className={`text-center p-2 rounded-lg border-2 ${getTableCellBackground(selectedVehicle1?.specifications?.msrp_usd, selectedVehicle2.specifications?.msrp_usd, false)}`}>
                                <div className="text-xl font-bold text-primary">
                                  {selectedVehicle2.specifications?.msrp_usd ? `$${selectedVehicle2.specifications.msrp_usd.toLocaleString()}` : 'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground">MSRP</div>
                              </div>
                              <div className={`text-center p-2 rounded-lg border-2 ${getTableCellBackground(selectedVehicle2.specifications?.range_miles, selectedVehicle1?.specifications?.range_miles, true)}`}>
                                <div className="text-xl font-bold text-primary">
                                  {formatSpec(selectedVehicle2.specifications?.range_miles, 'mi')}
                                </div>
                                <div className="text-xs text-muted-foreground">Range</div>
                              </div>
                              <div className={`text-center p-2 rounded-lg border-2 ${getTableCellBackground(selectedVehicle2.specifications?.power_hp, selectedVehicle1?.specifications?.power_hp, true)}`}>
                                <div className="text-xl font-bold text-primary">
                                  {formatSpec(selectedVehicle2.specifications?.power_hp, 'hp')}
                                </div>
                                <div className="text-xs text-muted-foreground">Power</div>
                      </div>
                    </div>
                          </td>
                        )}
                      </tr>
                      
                      {/* All Other Specifications */}
                      {[
                        { name: 'Battery Capacity', key: 'battery_capacity_kwh', unit: 'kWh', icon: Battery, color: 'text-green-500', higherIsBetter: true },
                        { name: '0-60 Acceleration', key: 'acceleration_0_60', unit: 's', icon: Zap, color: 'text-blue-500', higherIsBetter: false },
                        { name: 'Top Speed', key: 'top_speed_mph', unit: 'mph', icon: TrendingUp, color: 'text-red-500', higherIsBetter: true },
                        { name: 'Torque', key: 'torque_lb_ft', unit: 'lb-ft', icon: Car, color: 'text-purple-500', higherIsBetter: true },
                        { name: 'Weight', key: 'weight_lbs', unit: 'lbs', icon: Car, color: 'text-gray-500', higherIsBetter: false },
                        { name: 'Seating Capacity', key: 'seating_capacity', unit: 'seats', icon: Car, color: 'text-indigo-500', higherIsBetter: true },
                        { name: 'Cargo Capacity', key: 'cargo_capacity_cu_ft', unit: 'cu ft', icon: Car, color: 'text-orange-500', higherIsBetter: true },
                        { name: 'Wheelbase', key: 'wheelbase_inches', unit: 'in', icon: Car, color: 'text-cyan-500', higherIsBetter: true },
                        { name: 'Length', key: 'length_inches', unit: 'in', icon: Car, color: 'text-pink-500', higherIsBetter: true },
                        { name: 'Width', key: 'width_inches', unit: 'in', icon: Car, color: 'text-teal-500', higherIsBetter: true },
                        { name: 'Height', key: 'height_inches', unit: 'in', icon: Car, color: 'text-amber-500', higherIsBetter: true }
                      ].map((spec) => {
                        const IconComponent = spec.icon;
                        const value1 = selectedVehicle1?.specifications?.[spec.key as keyof typeof selectedVehicle1.specifications] as number;
                        const value2 = selectedVehicle2?.specifications?.[spec.key as keyof typeof selectedVehicle2.specifications] as number;
                        
                        return (
                          <tr key={spec.key} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-3 font-medium text-sm">
                      <div className="flex items-center gap-2">
                                <IconComponent className={`h-4 w-4 ${spec.color}`} />
                                {spec.name}
                              </div>
                            </td>
                            {selectedVehicle1 && (
                              <td className="p-3 text-center w-1/2">
                                <div className={`text-center p-2 rounded-lg border-2 ${selectedVehicle2 ? getTableCellBackground(value1, value2, spec.higherIsBetter) : 'bg-muted/50'}`}>
                        <span className="font-medium">
                                    {formatSpec(value1, spec.unit)}
                        </span>
                      </div>
                              </td>
                            )}
                            {selectedVehicle2 && (
                              <td className="p-3 text-center w-1/2">
                                <div className={`text-center p-2 rounded-lg border-2 ${getTableCellBackground(value2, value1, spec.higherIsBetter)}`}>
                        <span className="font-medium">
                                    {formatSpec(value2, spec.unit)}
                        </span>
                      </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-6">
                {/* Vehicle 1 Card */}
                {selectedVehicle1 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Link 
                        to={`/vehicles/${selectedVehicle1.id}`}
                        className="block w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-blue-500 bg-gray-100 dark:bg-gray-800 hover:border-blue-600 dark:hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        {selectedVehicle1.profile_image_url ? (
                          <img 
                            src={selectedVehicle1.profile_image_url} 
                            alt={`${selectedVehicle1.manufacturer?.name} ${selectedVehicle1.model}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-blue-500 ${selectedVehicle1.profile_image_url ? 'hidden' : ''}`}>
                          <Car className="h-12 w-12" />
                        </div>
                      </Link>
                      <div className="mt-3">
                        <Link 
                          to={`/vehicles/${selectedVehicle1.id}`}
                          className="font-medium text-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1 transition-colors"
                        >
                          {selectedVehicle1.manufacturer?.name} {selectedVehicle1.model}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        {selectedVehicle1.trim && (
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {selectedVehicle1.trim}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {selectedVehicle1.body_style || 'Vehicle'}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle 1 Specifications */}
                    <div className="space-y-3">
                      {/* Key Specifications */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`p-3 rounded-lg border-2 ${selectedVehicle2 ? getTableCellBackground(selectedVehicle2.specifications?.msrp_usd, selectedVehicle1.specifications?.msrp_usd, false) : 'bg-muted/50'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">MSRP</span>
                            <span className="text-lg font-bold text-primary">
                              {selectedVehicle1.specifications?.msrp_usd ? `$${selectedVehicle1.specifications.msrp_usd.toLocaleString()}` : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg border-2 ${selectedVehicle2 ? getTableCellBackground(selectedVehicle1.specifications?.range_miles, selectedVehicle2.specifications?.range_miles, true) : 'bg-muted/50'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Range</span>
                            <span className="text-lg font-bold text-primary">
                              {formatSpec(selectedVehicle1.specifications?.range_miles, 'mi')}
                            </span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg border-2 ${selectedVehicle2 ? getTableCellBackground(selectedVehicle1.specifications?.power_hp, selectedVehicle2.specifications?.power_hp, true) : 'bg-muted/50'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Power</span>
                            <span className="text-lg font-bold text-primary">
                              {formatSpec(selectedVehicle1.specifications?.power_hp, 'hp')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Other Specifications */}
                      {[
                        { name: 'Battery Capacity', key: 'battery_capacity_kwh', unit: 'kWh', icon: Battery, color: 'text-green-500', higherIsBetter: true },
                        { name: '0-60 Acceleration', key: 'acceleration_0_60', unit: 's', icon: Zap, color: 'text-blue-500', higherIsBetter: false },
                        { name: 'Top Speed', key: 'top_speed_mph', unit: 'mph', icon: TrendingUp, color: 'text-red-500', higherIsBetter: true },
                        { name: 'Torque', key: 'torque_lb_ft', unit: 'lb-ft', icon: Car, color: 'text-purple-500', higherIsBetter: true },
                        { name: 'Weight', key: 'weight_lbs', unit: 'lbs', icon: Car, color: 'text-gray-500', higherIsBetter: false },
                        { name: 'Seating Capacity', key: 'seating_capacity', unit: 'seats', icon: Car, color: 'text-indigo-500', higherIsBetter: true },
                        { name: 'Cargo Capacity', key: 'cargo_capacity_cu_ft', unit: 'cu ft', icon: Car, color: 'text-orange-500', higherIsBetter: true },
                        { name: 'Wheelbase', key: 'wheelbase_inches', unit: 'in', icon: Car, color: 'text-cyan-500', higherIsBetter: true },
                        { name: 'Length', key: 'length_inches', unit: 'in', icon: Car, color: 'text-pink-500', higherIsBetter: true },
                        { name: 'Width', key: 'width_inches', unit: 'in', icon: Car, color: 'text-teal-500', higherIsBetter: true },
                        { name: 'Height', key: 'height_inches', unit: 'in', icon: Car, color: 'text-amber-500', higherIsBetter: true }
                      ].map((spec) => {
                        const IconComponent = spec.icon;
                        const value1 = selectedVehicle1?.specifications?.[spec.key as keyof typeof selectedVehicle1.specifications] as number;
                        const value2 = selectedVehicle2?.specifications?.[spec.key as keyof typeof selectedVehicle2.specifications] as number;
                        
                        return (
                          <div key={spec.key} className={`p-3 rounded-lg border-2 ${selectedVehicle2 ? getTableCellBackground(value1, value2, spec.higherIsBetter) : 'bg-muted/50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <IconComponent className={`h-4 w-4 ${spec.color}`} />
                                <span className="text-sm font-medium text-muted-foreground">{spec.name}</span>
                              </div>
                              <span className="font-medium">
                                {formatSpec(value1, spec.unit)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vehicle 2 Card */}
                {selectedVehicle2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Link 
                        to={`/vehicles/${selectedVehicle2.id}`}
                        className="block w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-red-500 bg-gray-100 dark:bg-gray-800 hover:border-red-600 dark:hover:border-red-400 transition-colors cursor-pointer"
                      >
                        {selectedVehicle2.profile_image_url ? (
                          <img 
                            src={selectedVehicle2.profile_image_url} 
                            alt={`${selectedVehicle2.manufacturer?.name} ${selectedVehicle2.model}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-red-500 ${selectedVehicle2.profile_image_url ? 'hidden' : ''}`}>
                          <Car className="h-12 w-12" />
                        </div>
                      </Link>
                      <div className="mt-3">
                        <Link 
                          to={`/vehicles/${selectedVehicle2.id}`}
                          className="font-medium text-lg text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center justify-center gap-1 transition-colors"
                        >
                          {selectedVehicle2.manufacturer?.name} {selectedVehicle2.model}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        {selectedVehicle2.trim && (
                          <div className="text-sm font-medium text-red-600 dark:text-red-400">
                            {selectedVehicle2.trim}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {selectedVehicle2.body_style || 'Vehicle'}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle 2 Specifications */}
                    <div className="space-y-3">
                      {/* Key Specifications */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`p-3 rounded-lg border-2 ${getTableCellBackground(selectedVehicle1?.specifications?.msrp_usd, selectedVehicle2.specifications?.msrp_usd, false)}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">MSRP</span>
                            <span className="text-lg font-bold text-primary">
                              {selectedVehicle2.specifications?.msrp_usd ? `$${selectedVehicle2.specifications.msrp_usd.toLocaleString()}` : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg border-2 ${getTableCellBackground(selectedVehicle2.specifications?.range_miles, selectedVehicle1?.specifications?.range_miles, true)}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Range</span>
                            <span className="text-lg font-bold text-primary">
                              {formatSpec(selectedVehicle2.specifications?.range_miles, 'mi')}
                            </span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg border-2 ${getTableCellBackground(selectedVehicle2.specifications?.power_hp, selectedVehicle1?.specifications?.power_hp, true)}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Power</span>
                            <span className="text-lg font-bold text-primary">
                              {formatSpec(selectedVehicle2.specifications?.power_hp, 'hp')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Other Specifications */}
                      {[
                        { name: 'Battery Capacity', key: 'battery_capacity_kwh', unit: 'kWh', icon: Battery, color: 'text-green-500', higherIsBetter: true },
                        { name: '0-60 Acceleration', key: 'acceleration_0_60', unit: 's', icon: Zap, color: 'text-blue-500', higherIsBetter: false },
                        { name: 'Top Speed', key: 'top_speed_mph', unit: 'mph', icon: TrendingUp, color: 'text-red-500', higherIsBetter: true },
                        { name: 'Torque', key: 'torque_lb_ft', unit: 'lb-ft', icon: Car, color: 'text-purple-500', higherIsBetter: true },
                        { name: 'Weight', key: 'weight_lbs', unit: 'lbs', icon: Car, color: 'text-gray-500', higherIsBetter: false },
                        { name: 'Seating Capacity', key: 'seating_capacity', unit: 'seats', icon: Car, color: 'text-indigo-500', higherIsBetter: true },
                        { name: 'Cargo Capacity', key: 'cargo_capacity_cu_ft', unit: 'cu ft', icon: Car, color: 'text-orange-500', higherIsBetter: true },
                        { name: 'Wheelbase', key: 'wheelbase_inches', unit: 'in', icon: Car, color: 'text-cyan-500', higherIsBetter: true },
                        { name: 'Length', key: 'length_inches', unit: 'in', icon: Car, color: 'text-pink-500', higherIsBetter: true },
                        { name: 'Width', key: 'width_inches', unit: 'in', icon: Car, color: 'text-teal-500', higherIsBetter: true },
                        { name: 'Height', key: 'height_inches', unit: 'in', icon: Car, color: 'text-amber-500', higherIsBetter: true }
                      ].map((spec) => {
                        const IconComponent = spec.icon;
                        const value1 = selectedVehicle1?.specifications?.[spec.key as keyof typeof selectedVehicle1.specifications] as number;
                        const value2 = selectedVehicle2?.specifications?.[spec.key as keyof typeof selectedVehicle2.specifications] as number;
                        
                        return (
                          <div key={spec.key} className={`p-3 rounded-lg border-2 ${getTableCellBackground(value2, value1, spec.higherIsBetter)}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <IconComponent className={`h-4 w-4 ${spec.color}`} />
                                <span className="text-sm font-medium text-muted-foreground">{spec.name}</span>
                              </div>
                              <span className="font-medium">
                                {formatSpec(value2, spec.unit)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              </CardContent>
            </Card>
        </div>
      )}
      
      {/* Recent News Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <TrendingUpIcon className="h-8 w-8" />
            Latest News
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
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm cursor-pointer overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                  onClick={() => {
                    if (article.source_url) {
                      window.open(article.source_url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  {/* Article Image Preview */}
                  {NewsImageService.getImageUrl(article) && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <img 
                        src={NewsImageService.getImageUrl(article)!} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                      {!NewsImageService.getImageUrl(article) && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
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
