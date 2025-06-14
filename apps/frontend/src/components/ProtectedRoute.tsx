import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

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