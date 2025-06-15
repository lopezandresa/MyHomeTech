import React from 'react'
import { Link } from 'react-router-dom'
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

/**
 * @fileoverview Página de perfil de usuario de MyHomeTech
 * 
 * @description Página protegida para gestión del perfil de usuario:
 * - Placeholder para funcionalidad futura
 * - Navegación de regreso al dashboard
 * - Diseño consistente con el resto de la aplicación
 * - Preparada para integración con componentes de perfil
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Componente de página de perfil de usuario
 * 
 * @description Página que eventualmente permitirá a los usuarios gestionar
 * su información personal. Actualmente muestra un mensaje de desarrollo
 * y proporciona navegación de regreso al dashboard.
 * 
 * Funcionalidades futuras planeadas:
 * - Edición de información personal
 * - Cambio de contraseña
 * - Gestión de foto de perfil
 * - Preferencias de notificación
 * - Historial de actividad
 * 
 * @returns {JSX.Element} Página de perfil con placeholder
 * 
 * @example
 * ```tsx
 * // Usado en App.tsx como ruta protegida
 * <Route 
 *   path="/profile" 
 *   element={
 *     <ProtectedRoute>
 *       <ProfilePage />
 *     </ProtectedRoute>
 *   } 
 * />
 * ```
 */
const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600">Gestiona tu información personal</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Perfil de Usuario</h2>
            <p className="text-gray-600 mb-6">
              Esta funcionalidad está en desarrollo. Pronto podrás gestionar tu información personal.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage