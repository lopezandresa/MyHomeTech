import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * @fileoverview Componente de protección de rutas autenticadas
 * 
 * @description Protege rutas que requieren autenticación, redirigiendo
 * usuarios no autenticados a la página principal con preservación
 * de la ruta de destino original.
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Props del componente ProtectedRoute
 * 
 * @interface ProtectedRouteProps
 * @property {React.ReactNode} children - Componentes que requieren autenticación
 */
interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Componente de ruta protegida
 * 
 * @description Wrapper que protege rutas sensibles verificando autenticación:
 * - Si el usuario está autenticado, renderiza los children
 * - Si no está autenticado, redirige a home preservando la ubicación original
 * - Útil para dashboard, perfil, configuración, etc.
 * 
 * @param {ProtectedRouteProps} props - Props del componente
 * @returns {JSX.Element} Children si autenticado, Navigate si no autenticado
 * 
 * @example
 * ```tsx
 * <Route 
 *   path="/dashboard" 
 *   element={
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   } 
 * />
 * ```
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    // Redirigir a home pero guardar la ubicación a la que querían ir
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute