import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DatabaseTest from '@/components/DatabaseTest';
import VehiclesPage from '@/pages/VehiclesPage';
import NewsPage from '@/pages/NewsPage';
import VehicleDetail from '@/components/vehicles/VehicleDetail';

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
          <CardTitle>Industry News</CardTitle>
          <CardDescription>Latest updates and industry insights</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get the latest news, rumors, and expert analysis from the electric vehicle industry.
          </p>
          <Button asChild>
            <a href="/news">Browse News</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);







const DatabaseTestPage = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Test</h1>
    <DatabaseTest />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/database-test" element={<DatabaseTestPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
