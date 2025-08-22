import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Placeholder page components - these will be replaced with actual implementations
const HomePage = () => (
  <div className="space-y-6">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to DataStorm
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Your comprehensive Electric Vehicle Data Hub
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Database</CardTitle>
          <CardDescription>Explore comprehensive EV specifications and data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Access detailed technical specifications, performance metrics, and comparison tools for electric vehicles.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Market Data</CardTitle>
          <CardDescription>Sales figures, trends, and market analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Stay informed with real-time market data, sales trends, and competitive analysis.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Industry News</CardTitle>
          <CardDescription>Latest updates and industry insights</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Get the latest news, rumors, and expert analysis from the electric vehicle industry.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const VehiclesPage = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vehicle Database</h1>
    <Card>
      <CardHeader>
        <CardTitle>Coming Soon</CardTitle>
        <CardDescription>Vehicle database implementation in progress</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400">
          This section will contain comprehensive vehicle data, specifications, and comparison tools.
        </p>
      </CardContent>
    </Card>
  </div>
);

const MarketPage = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market Data</h1>
    <Card>
      <CardHeader>
        <CardTitle>Coming Soon</CardTitle>
        <CardDescription>Market data implementation in progress</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400">
          This section will contain sales figures, market trends, and competitive analysis.
        </p>
      </CardContent>
    </Card>
  </div>
);

const NewsPage = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Industry News</h1>
    <Card>
      <CardHeader>
        <CardTitle>Coming Soon</CardTitle>
        <CardDescription>News aggregation implementation in progress</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400">
          This section will contain the latest industry news, rumors, and expert insights.
        </p>
      </CardContent>
    </Card>
  </div>
);

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
