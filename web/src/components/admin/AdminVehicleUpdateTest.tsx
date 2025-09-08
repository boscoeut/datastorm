import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleUpdateService, type VehicleUpdateParams } from '@/services/vehicle-update';
import { Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';

export const AdminVehicleUpdateTest: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Test with a simple vehicle update
      const testParams: VehicleUpdateParams = {
        manufacturer: 'Tesla',
        model: 'Model 3',
        trim: 'Performance',
        year: 2024
      };

      console.log('🧪 Running admin vehicle update test with params:', testParams);
      
      const result = await VehicleUpdateService.updateVehicleDetails(testParams);
      
      setTestResult({
        success: result.success,
        message: result.message,
        error: result.error
      });

      console.log('✅ Test completed:', result);
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResult({
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Admin Vehicle Update Test
        </CardTitle>
        <CardDescription>
          Test the admin vehicle update functionality with a sample Tesla Model 3.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTest} 
          disabled={isTesting}
          className="flex items-center gap-2"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Test...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4" />
              Run Test
            </>
          )}
        </Button>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {testResult.success ? 'Test Passed' : 'Test Failed'}
              </span>
            </div>
            <p className="text-sm">{testResult.message}</p>
            {testResult.error && (
              <p className="text-sm mt-2 font-mono bg-white/50 p-2 rounded">
                {testResult.error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
