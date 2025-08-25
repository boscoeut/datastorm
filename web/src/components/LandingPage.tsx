
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleBarChart } from '@/components/ui/chart';

// Mock data for demonstration - in a real app, this would come from your data store
const mockMetrics = {
  totalVehicles: 1247,
  totalNews: 89,
  activeUsers: 2341,
  dataPoints: 156789,
  topBrands: ['Tesla', 'Ford', 'Volkswagen', 'BMW', 'Mercedes'],
  recentTrends: [
    { name: 'Battery Range', change: '+12%', trend: 'up' as const },
    { name: 'Charging Speed', change: '+8%', trend: 'up' as const },
    { name: 'Price', change: '-5%', trend: 'down' as const },
  ],
  marketShare: [
    { label: 'Tesla', value: 18.2, color: '#3B82F6' },
    { label: 'BYD', value: 15.6, color: '#10B981' },
    { label: 'Volkswagen', value: 12.8, color: '#8B5CF6' },
    { label: 'Ford', value: 8.9, color: '#F59E0B' },
    { label: 'BMW', value: 7.4, color: '#EF4444' },
  ],
  monthlyGrowth: [
    { label: 'Jan', value: 12, color: '#3B82F6' },
    { label: 'Feb', value: 18, color: '#10B981' },
    { label: 'Mar', value: 15, color: '#8B5CF6' },
    { label: 'Apr', value: 22, color: '#F59E0B' },
    { label: 'May', value: 28, color: '#EF4444' },
    { label: 'Jun', value: 35, color: '#EC4899' },
  ]
};

const MetricCard = ({ title, value, subtitle, icon, trend, className = '' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: { value: string; direction: 'up' | 'down' };
  className?: string;
}) => (
  <Card className={`relative overflow-hidden ${className}`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16" />
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      {trend && (
        <div className={`flex items-center mt-2 text-sm ${
          trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-1">
            {trend.direction === 'up' ? '↗' : '↘'}
          </span>
          {trend.value}
        </div>
      )}
    </CardContent>
  </Card>
);

const TrendCard = ({ title, trends }: { title: string; trends: Array<{ name: string; change: string; trend: 'up' | 'down' }> }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {trends.map((trend, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{trend.name}</span>
            <div className="flex items-center space-x-2">
              <Badge variant={trend.trend === 'up' ? 'default' : 'secondary'}>
                {trend.change}
              </Badge>
              <span className={`text-sm ${trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend.trend === 'up' ? '↗' : '↘'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const BrandCard = ({ brands }: { brands: string[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Top EV Brands</CardTitle>
      <CardDescription>Leading manufacturers in our database</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand, index) => (
          <Badge key={index} variant="outline" className="text-sm">
            {brand}
          </Badge>
        ))}
      </div>
    </CardContent>
  </Card>
);

const LandingPage = () => {
  return (
    <div className="space-y-8">
      {/* Real-time Data Ticker */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Live Data Updates</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span>{mockMetrics.dataPoints.toLocaleString()} data points tracked</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🚗</span>
            <span>{mockMetrics.totalVehicles.toLocaleString()} vehicles</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>👥</span>
            <span>{mockMetrics.activeUsers.toLocaleString()} active users</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to DataStorm
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive Electric Vehicle Data Hub with real-time insights, trends, and comprehensive specifications
          </p>
        </div>
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <MetricCard
            title="Total Vehicles"
            value={mockMetrics.totalVehicles.toLocaleString()}
            subtitle="EVs in database"
            icon="🚗"
            trend={{ value: '+23 this week', direction: 'up' }}
          />
          <MetricCard
            title="Data Points"
            value={mockMetrics.dataPoints.toLocaleString()}
            subtitle="Specifications tracked"
            icon="📊"
            trend={{ value: '+1,234 today', direction: 'up' }}
          />
          <MetricCard
            title="Active Users"
            value={mockMetrics.activeUsers.toLocaleString()}
            subtitle="Monthly visitors"
            icon="👥"
            trend={{ value: '+12% vs last month', direction: 'up' }}
          />
          <MetricCard
            title="News Articles"
            value={mockMetrics.totalNews}
            subtitle="Industry updates"
            icon="📰"
            trend={{ value: '+5 this week', direction: 'up' }}
          />
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <span className="text-3xl">🔍</span>
              <span>Vehicle Database</span>
            </CardTitle>
            <CardDescription className="text-base">
              Explore comprehensive EV specifications and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Access detailed technical specifications, performance metrics, and comparison tools for electric vehicles.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>• {mockMetrics.totalVehicles.toLocaleString()} vehicles</span>
              <span>• Real-time data</span>
              <span>• Advanced filters</span>
            </div>
            <Button asChild className="w-full">
              <a href="/vehicles">Explore Database</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <span className="text-3xl">📈</span>
              <span>Industry News</span>
            </CardTitle>
            <CardDescription className="text-base">
              Latest updates and industry insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Get the latest news, rumors, and expert analysis from the electric vehicle industry.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>• {mockMetrics.totalNews} articles</span>
              <span>• Daily updates</span>
              <span>• Expert analysis</span>
            </div>
            <Button asChild className="w-full">
              <a href="/news">Browse News</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Insights Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Data Insights</h2>
          <p className="text-muted-foreground">Real-time trends and market analysis</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <TrendCard title="Market Trends" trends={mockMetrics.recentTrends} />
          <BrandCard brands={mockMetrics.topBrands} />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database Growth</span>
                <span className="font-semibold text-green-600">+15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Data Accuracy</span>
                <span className="font-semibold text-blue-600">99.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Update Frequency</span>
                <span className="font-semibold text-purple-600">Real-time</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Share</CardTitle>
              <CardDescription>Top EV manufacturers</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart 
                data={mockMetrics.marketShare} 
                maxValue={20}
                className="mt-4"
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Growth Chart Section */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Database Growth</CardTitle>
              <CardDescription>New vehicles added per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4 mt-4">
                {mockMetrics.monthlyGrowth.map((month, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">{month.label}</div>
                    <div 
                      className="w-full bg-secondary rounded-t-sm transition-all duration-500 hover:opacity-80"
                      style={{ 
                        height: `${(month.value / 35) * 100}px`,
                        backgroundColor: month.color 
                      }}
                    />
                    <div className="text-xs font-medium mt-1">{month.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Quick Actions</h2>
          <p className="text-muted-foreground">Get started with popular searches</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <a href="/vehicles?search=tesla">
              <span className="text-2xl">🚗</span>
              <span className="font-medium">Tesla Models</span>
              <span className="text-xs text-muted-foreground">Compare Tesla vehicles</span>
            </a>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <a href="/vehicles?search=range">
              <span className="text-2xl">🔋</span>
              <span className="font-medium">Long Range EVs</span>
              <span className="text-xs text-muted-foreground">300+ mile range</span>
            </a>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <a href="/vehicles?search=affordable">
              <span className="text-2xl">💰</span>
              <span className="font-medium">Affordable EVs</span>
              <span className="text-xs text-muted-foreground">Under $40k</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200/20">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-2">Ready to dive deep into EV data?</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring our comprehensive database and stay updated with the latest industry trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <a href="/vehicles">Start Exploring</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/news">Read News</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
