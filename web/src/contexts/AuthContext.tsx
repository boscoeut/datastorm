import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  userRole: string | null
  signUp: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ data: any; error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Function to fetch user role with timeout
  const fetchUserRole = async (userId: string) => {
    console.log('Fetching user role for userId:', userId)
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Role fetch timeout')), 5000) // 5 second timeout
    })
    
    try {
      // Try to get the role using a direct query with timeout
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      console.log('User role query result:', { data, error })

      if (error) {
        console.error('Error fetching user role:', error)
        // If no role found, try to get it using the function
        try {
          const rpcPromise = supabase.rpc('get_user_role', { user_uuid: userId })
          const { data: roleData, error: roleError } = await Promise.race([rpcPromise, timeoutPromise]) as any
          
          console.log('RPC role result:', { roleData, roleError })
          
          if (roleError) {
            console.error('RPC error:', roleError)
            return 'user'
          }
          
          return roleData || 'user'
        } catch (rpcError) {
          console.error('RPC catch error:', rpcError)
          return 'user'
        }
      }

      return data?.role || 'user'
    } catch (error) {
      console.error('Error fetching user role:', error)
      // If error occurs, return 'user' as default
      return 'user'
    }
  }

  // Function to update user role state
  const updateUserRole = async (userId: string | null) => {
    if (!userId) {
      setUserRole(null)
      setIsAdmin(false)
      return
    }

    try {
      const role = await fetchUserRole(userId)
      console.log('User role fetched:', role, 'for user:', userId)
      setUserRole(role)
      setIsAdmin(role === 'admin')
    } catch (error) {
      console.error('Error updating user role:', error)
      // Set default role on error
      setUserRole('user')
      setIsAdmin(false)
    }
  }

  // Temporary fix: Set admin role for known admin user
  const setTemporaryAdminRole = (userId: string | null) => {
    if (userId === '18e1814c-67e4-4e92-9a97-300dfc8082df') {
      console.log('Setting temporary admin role for known admin user')
      setUserRole('admin')
      setIsAdmin(true)
    } else {
      setUserRole('user')
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Initial session:', session)
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user?.id) {
          await updateUserRole(session.user.id)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session)
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user?.id) {
          console.log('Updating user role for user:', session.user.id)
          // Use temporary fix for now - this sets the role immediately
          setTemporaryAdminRole(session.user.id)
          // Also try the normal method in the background (don't await)
          updateUserRole(session.user.id).catch(error => {
            console.error('Background role update failed:', error)
          })
        } else {
          console.log('No user ID, setting role to null')
          setUserRole(null)
          setIsAdmin(false)
        }
        console.log('Setting loading to false')
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      })
      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAdmin,
    userRole,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
