import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from './LoginForm'
import { LogOut, User, Shield, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const AuthButton: React.FC = () => {
  const { user, isAdmin, signOut, loading } = useAuth()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginForm(false)
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <User className="h-4 w-4" />
          <span>{user.email}</span>
          {isAdmin && (
            <Shield className="h-4 w-4 text-blue-600" title="Admin" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowLoginForm(true)}
      >
        Sign In
      </Button>

      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 bg-white dark:bg-gray-800 rounded-full p-1 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600"
              onClick={() => setShowLoginForm(false)}
              aria-label="Close sign in dialog"
            >
              <X className="h-4 w-4" />
            </Button>
            <LoginForm 
              onSuccess={handleLoginSuccess}
              onCancel={() => setShowLoginForm(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
