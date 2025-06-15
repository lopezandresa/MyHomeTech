import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, UpdateProfileRequest } from '../types'
import { authService } from '../services/authService'

/**
 * @fileoverview Contexto de autenticación global para MyHomeTech
 * 
 * @description Provee gestión centralizada de autenticación incluyendo:
 * - Estado de usuario y token JWT
 * - Funciones de login/registro/logout
 * - Persistencia de sesión en localStorage
 * - Actualización automática de perfil
 * - Verificación de autenticación al cargar
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Interfaz del contexto de autenticación
 * 
 * @interface AuthContextType
 * @property {User | null} user - Usuario autenticado actual
 * @property {string | null} token - Token JWT de autenticación
 * @property {boolean} isAuthenticated - Estado de autenticación
 * @property {boolean} isLoading - Estado de carga
 * @property {Function} login - Función para iniciar sesión
 * @property {Function} register - Función para registrar usuario
 * @property {Function} logout - Función para cerrar sesión
 * @property {Function} updateProfile - Función para actualizar perfil
 * @property {Function} refreshUser - Función para refrescar datos del usuario
 */
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

/**
 * Props del proveedor de autenticación
 * 
 * @interface AuthProviderProps
 * @property {ReactNode} children - Componentes hijo que tendrán acceso al contexto
 */
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Proveedor de contexto de autenticación
 * 
 * @description Componente que provee el contexto de autenticación a toda la aplicación.
 * Gestiona el estado global de autenticación y persiste la sesión.
 * 
 * @param {AuthProviderProps} props - Props del componente
 * @returns {JSX.Element} Proveedor de contexto con children
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
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

  /**
   * Refresca los datos del usuario desde el servidor
   * 
   * @description Obtiene la información actualizada del usuario autenticado
   * sin requerir un nuevo login
   * 
   * @throws {Error} Si no hay token de autenticación o falla la petición
   * 
   * @example
   * ```typescript
   * await refreshUser(); // Actualiza user con datos del servidor
   * ```
   */
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

  /**
   * Inicia sesión de usuario
   * 
   * @description Autentica al usuario con email y contraseña.
   * No redirige automáticamente, la redirección debe manejarse en el componente llamador.
   * 
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @throws {Error} Si las credenciales son incorrectas
   * 
   * @example
   * ```typescript
   * try {
   *   await login('user@example.com', 'password123');
   *   navigate('/dashboard');
   * } catch (error) {
   *   console.error('Error en login:', error);
   * }
   * ```
   */
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

  /**
   * Registra un nuevo usuario en el sistema
   * 
   * @description Crea una cuenta nueva sin iniciar sesión automáticamente.
   * El usuario debe hacer login después del registro.
   * 
   * @param {string} firstName - Primer nombre
   * @param {string | undefined} middleName - Segundo nombre (opcional)
   * @param {string} firstLastName - Primer apellido
   * @param {string | undefined} secondLastName - Segundo apellido (opcional)
   * @param {string} email - Email único del usuario
   * @param {string} password - Contraseña (mínimo 6 caracteres)
   * @param {'client' | 'technician'} role - Rol del usuario
   * @returns {Promise<User>} Usuario creado
   * @throws {Error} Si el email ya existe o datos inválidos
   * 
   * @example
   * ```typescript
   * try {
   *   const newUser = await register(
   *     'Juan', 'Carlos', 'Pérez', 'García',
   *     'juan@example.com', 'password123', 'client'
   *   );
   *   console.log('Usuario registrado:', newUser.email);
   * } catch (error) {
   *   console.error('Error en registro:', error);
   * }
   * ```
   */
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

  /**
   * Cierra la sesión del usuario
   * 
   * @description Limpia el estado de autenticación local y del localStorage.
   * No redirige automáticamente, debe manejarse en el componente llamador.
   * 
   * @example
   * ```typescript
   * logout();
   * navigate('/');
   * ```
   */
  const logout = (): void => {
    authService.logout()
    setUser(null)
    setToken(null)
  }

  /**
   * Actualiza el perfil del usuario autenticado
   * 
   * @description Actualiza la información del usuario y refresca el estado local
   * 
   * @param {UpdateProfileRequest} data - Datos a actualizar
   * @throws {Error} Si falla la actualización
   * 
   * @example
   * ```typescript
   * await updateProfile({
   *   firstName: 'Juan Carlos',
   *   phone: '+57 300 123 4567'
   * });
   * ```
   */
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

/**
 * Hook para usar el contexto de autenticación
 * 
 * @description Hook personalizado que proporciona acceso al contexto de autenticación.
 * Debe usarse dentro de un AuthProvider.
 * 
 * @returns {AuthContextType} Objeto con estado y funciones de autenticación
 * @throws {Error} Si se usa fuera de un AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>Bienvenido {user?.firstName}</h1>
 *       <button onClick={logout}>Cerrar Sesión</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}