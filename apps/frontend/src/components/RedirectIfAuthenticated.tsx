import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * @fileoverview Componente de redirección para usuarios ya autenticados
 * 
 * @description Redirige usuarios autenticados lejos de páginas públicas
 * como login/registro, enviándolos directamente al dashboard.
 * Incluye pantalla de carga mientras se verifica el estado.
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Props del componente RedirectIfAuthenticated
 * 
 * @interface RedirectIfAuthenticatedProps
 * @property {React.ReactNode} children - Componentes de página pública
 */
interface RedirectIfAuthenticatedProps {
  children: React.ReactNode
}

/**
 * Componente de redirección condicional
 * 
 * @description Wrapper para páginas públicas que redirige usuarios autenticados:
 * - Si está cargando, muestra spinner elegante
 * - Si está autenticado, redirige al dashboard
 * - Si no está autenticado, muestra la página pública (children)
 * - Evita que usuarios autenticados vean login/registro
 * 
 * @param {RedirectIfAuthenticatedProps} props - Props del componente
 * @returns {JSX.Element} Loading, Navigate o children según estado
 * 
 * @example
 * ```tsx
 * <Route 
 *   index 
 *   element={
 *     <RedirectIfAuthenticated>
 *       <HomePage />
 *     </RedirectIfAuthenticated>
 *   } 
 * />
 * ```
 */
const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isProcessingLogin } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Cargando MyHomeTech...</h2>
        </div>
      </div>
    )
  }

  // NO redirigir si se está procesando un login (prevenir interferencia con modal de login)
  if (isProcessingLogin) {
    return <>{children}</>
  }

  // Si está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Si no está autenticado, mostrar la página pública
  return <>{children}</>
}

export default RedirectIfAuthenticated