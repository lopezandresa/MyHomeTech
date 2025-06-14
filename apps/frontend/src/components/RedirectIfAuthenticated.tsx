import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode
}

const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

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

  // Si está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Si no está autenticado, mostrar el contenido (home)
  return <>{children}</>
}

export default RedirectIfAuthenticated