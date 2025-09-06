import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ManufacturerService, VehicleService } from '@/services/database'

const DatabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [testResults, setTestResults] = useState<{
    manufacturers: any[]
    vehicles: any[]
    connection: boolean
  }>({
    manufacturers: [],
    vehicles: [],
    connection: false
  })

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      setConnectionStatus('testing')
      setErrorMessage('')

      // Test basic connection
      const { error: connectionError } = await supabase
        .from('manufacturers')
        .select('count')
        .limit(1)

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`)
      }

      setTestResults(prev => ({ ...prev, connection: true }))
      setConnectionStatus('connected')

      // Test manufacturer service
      const manufacturers = await ManufacturerService.list()
      if (manufacturers.error) {
        console.warn('Manufacturer service warning:', manufacturers.error.message)
      } else {
        setTestResults(prev => ({ ...prev, manufacturers: manufacturers.data || [] }))
      }

      // Test vehicle service
      const vehicles = await VehicleService.list()
      if (vehicles.error) {
        console.warn('Vehicle service warning:', vehicles.error.message)
      } else {
        setTestResults(prev => ({ ...prev, vehicles: vehicles.data || [] }))
      }

    } catch (error) {
      setConnectionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
      setTestResults(prev => ({ ...prev, connection: false }))
    }
  }

  const runSampleQueries = async () => {
    try {
      // Test a more complex query
      const { data: vehiclesWithDetails, error: detailError } = await supabase
        .from('vehicles')
        .select(`
          *,
          manufacturer:manufacturers(*),
          specifications:vehicle_specifications(*)
        `)
        .limit(3)

      if (detailError) {
        console.error('Complex query error:', detailError)
      } else {
        console.log('Vehicles with details:', vehiclesWithDetails)
      }

      // Test real-time subscription (just for testing)
      const subscription = supabase
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'manufacturers' }, (payload) => {
          console.log('Real-time update:', payload)
        })
        .subscribe()

      // Cleanup subscription after 5 seconds
      setTimeout(() => {
        subscription.unsubscribe()
      }, 5000)

    } catch (error) {
      console.error('Sample queries error:', error)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Database Connection Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className={`font-medium ${
            connectionStatus === 'connected' ? 'text-green-700' :
            connectionStatus === 'error' ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'error' ? 'Connection Failed' : 'Testing...'}
          </span>
        </div>
        {errorMessage && (
          <p className="text-red-600 mt-2 text-sm">{errorMessage}</p>
        )}
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Manufacturers</h4>
          <p className="text-sm text-gray-600">
            Count: {testResults.manufacturers.length}
          </p>
          {testResults.manufacturers.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">Sample:</p>
              <p className="text-sm">{testResults.manufacturers[0]?.name}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Vehicles</h4>
          <p className="text-sm text-gray-600">
            Count: {testResults.vehicles.length}
          </p>
          {testResults.vehicles.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">Sample:</p>
              <p className="text-sm">{testResults.vehicles[0]?.model}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-x-4">
        <button
          onClick={testDatabaseConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Test Connection
        </button>
        <button
          onClick={runSampleQueries}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Run Sample Queries
        </button>
      </div>

      {/* Environment Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold mb-2">Environment Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</p>
          <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</p>
        </div>
      </div>

      {/* Sample Data Display */}
      {testResults.manufacturers.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Sample Manufacturers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testResults.manufacturers.slice(0, 6).map((manufacturer) => (
              <div key={manufacturer.id} className="bg-white p-3 rounded border">
                <p className="font-medium">{manufacturer.name}</p>
                <p className="text-sm text-gray-600">{manufacturer.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {testResults.vehicles.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Sample Vehicles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testResults.vehicles.slice(0, 6).map((vehicle) => (
              <div key={vehicle.id} className="bg-white p-3 rounded border">
                <p className="font-medium">{vehicle.model}</p>
                <p className="text-sm text-gray-600">{vehicle.body_style}</p>
                <p className="text-xs text-gray-500">
                  Electric: {vehicle.is_electric ? 'Yes' : 'No'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatabaseTest
