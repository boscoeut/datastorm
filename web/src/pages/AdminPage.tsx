import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { VehicleUpdateForm } from '@/components/admin/VehicleUpdateForm';
import { AdminVehicleUpdateTest } from '@/components/admin/AdminVehicleUpdateTest';
import { EVSearchForm } from '@/components/admin/EVSearchForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Car, Database, Settings } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage vehicle database, update vehicle information, and access administrative tools.
          </p>
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5 text-blue-600" />
                Vehicle Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Update vehicle details using AI-powered research and data extraction.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5 text-green-600" />
                Database Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access SQL interface and database management tools.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-purple-600" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Configure system settings and manage application preferences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Update Form */}
        <VehicleUpdateForm />

        {/* EV Search Form */}
        <EVSearchForm />

        {/* Test Component */}
        <AdminVehicleUpdateTest />
      </div>
    </div>
  );
};
