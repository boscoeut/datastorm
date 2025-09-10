import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { VehicleUpdateForm } from '@/components/admin/VehicleUpdateForm';
import { AdminVehicleUpdateTest } from '@/components/admin/AdminVehicleUpdateTest';
import { EVSearchForm } from '@/components/admin/EVSearchForm';
import { IndustryNewsForm } from '@/components/admin/IndustryNewsForm';
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Manage vehicle database, update vehicle information, and access administrative tools.
          </p>
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Car className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Vehicle Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Update vehicle details using AI-powered research and data extraction.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Database Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Access database management tools and vehicle updates.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Configure system settings and manage application preferences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Update Form */}
        <VehicleUpdateForm />

        {/* EV Search Form */}
        <EVSearchForm />

        {/* Industry News Form */}
        <IndustryNewsForm />

        {/* Test Component */}
        <AdminVehicleUpdateTest />
      </div>
    </div>
  );
};
