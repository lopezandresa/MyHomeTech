import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, UpdateProfileRequest } from '../types'
import { authService } from '../services/authService'

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string, 
    middleName: string | undefined, 
    firstLastName: string, 
    secondLastName: string | undefined, 
    email: string, 
    password: string, 
    role: 'client' | 'technician'
  ) => Promise<User>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const storedToken = localStorage.getItem('authToken')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          // Verificar si el token es válido antes de continuar
          if (authService.isAuthenticated()) {
            setToken(storedToken)
            const userData = JSON.parse(storedUser)
            setUser(userData)
            
            // Intentar refrescar los datos del usuario del servidor
            try {
              const currentUser = await authService.getProfile()
              setUser(currentUser)
            } catch (error) {
              console.warn('No se pudo refrescar el perfil del usuario:', error)
              // Mantener los datos del localStorage si el refresh falla
            }
          } else {
            // Token inválido o expirado, limpiar todo
            authService.logout()
            setUser(null)
            setToken(null)
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        authService.logout()
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Función para refrescar datos del usuario desde el servidor
  const refreshUser = async (): Promise<void> => {
    try {
      if (!token) {
        throw new Error('No hay token de autenticación')
      }
      
      const currentUser = await authService.getProfile()
      setUser(currentUser)
    } catch (error) {
      console.error('Error refrescando usuario:', error)
      throw error
    }
  }

  // Login con manejo de errores mejorado
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      const result = await authService.login({ email, password })
      setUser(result.user)
      setToken(result.token)
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  // Register con manejo de errores mejorado
  const register = async (
    firstName: string, 
    middleName: string | undefined, 
    firstLastName: string, 
    secondLastName: string | undefined, 
    email: string, 
    password: string, 
    role: 'client' | 'technician'
  ): Promise<User> => {
    try {
      setIsLoading(true)
      const user = await authService.register({
        firstName,
        middleName,
        firstLastName,
        secondLastName,
        email,
        password,
        role,
      })
      return user
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout con limpieza completa del estado
  const logout = (): void => {
    authService.logout()
    setUser(null)
    setToken(null)
  }

  // Update profile con actualización del estado
  const updateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token && authService.isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}