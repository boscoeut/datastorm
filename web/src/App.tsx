import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DatabaseTest from '@/components/DatabaseTest';
import VehiclesPage from '@/pages/VehiclesPage';
import NewsPage from '@/pages/NewsPage';
import BattlePage from '@/pages/BattlePage';
import SqlPage from '@/pages/SqlPage';
import { AdminPage } from '@/pages/AdminPage';
import VehicleDetail from '@/components/vehicles/VehicleDetail';
import LandingPage from '@/components/LandingPage';
import { initializeStorage } from '@/lib/storage-init';

// Placeholder page components - these will be replaced with actual implementations
const HomePage = () => <LandingPage />;

const DatabaseTestPage = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Test</h1>
    <DatabaseTest />
  </div>
);

function App() {
  useEffect(() => {
    // Initialize Supabase storage on app startup
    initializeStorage();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/battle" element={<BattlePage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route 
                path="/sql" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <SqlPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
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
