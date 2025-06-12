import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/index'
import authService from '../services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: 'client' | 'technician') => Promise<void>
  logout: () => void
  updateProfile: (data: { name?: string; email?: string; password?: string }) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getProfile()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { user: loggedUser } = await authService.login({ email, password })
      setUser(loggedUser)
    } catch (error) {
      setIsLoading(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: 'client' | 'technician') => {
    try {
      setIsLoading(true)
      await authService.register({ name, email, password, role })
      // Después del registro, hacer login automático
      await login(email, password)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateProfile = async (data: { name?: string; email?: string; password?: string }) => {
    try {
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getProfile()
      setUser(currentUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}