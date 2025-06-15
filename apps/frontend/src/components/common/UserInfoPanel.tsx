import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import ProfilePhotoUpload from './ProfilePhotoUpload'
import { authService } from '../../services/authService'
import type { User } from '../../types/index'

interface UserInfoPanelProps {
  user: User | null
  isEditing: boolean
  formData: {
    firstName: string
    middleName: string
    firstLastName: string
    secondLastName: string
    email: string
    newPassword?: string // Nuevo campo para cambio de contraseña por admin
    [key: string]: any // Para permitir campos adicionales
  }
  error: string | null
  success: string | null
  isLoading: boolean
  showChangePassword: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEdit: () => void
  onSave: () => Promise<void>
  onCancel: () => void
  setShowChangePassword: (show: boolean) => void
  refreshUser?: () => Promise<void>
  title?: string
  subtitle?: string
  allowEmailEdit?: boolean // Nueva prop para permitir edición de email (solo admin)
  allowPasswordChange?: boolean // Nueva prop para permitir cambio de contraseña (solo admin)
}

const UserInfoPanel: React.FC<UserInfoPanelProps> = ({
  user,
  isEditing,
  formData,
  error,
  success,
  isLoading,
  onInputChange,
  onEdit,
  onSave,
  onCancel,
  setShowChangePassword,
  refreshUser,
  title = "Información Personal",
  subtitle = "Gestiona tu información personal",
  allowEmailEdit = false, // Por defecto false (usuarios normales)
  allowPasswordChange = false // Por defecto false (usuarios normales)
}) => {
  // Estados para manejo de foto de perfil
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [localIsLoading, setLocalIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Limpiar preview URL cuando el componente se desmonta o cambian los archivos
  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview)
      }
    }
  }, [profilePhotoPreview])

  const handlePhotoFileSelect = (file: File | null) => {
    // Limpiar preview URL anterior
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview)
      setProfilePhotoPreview(null)
    }

    setProfilePhotoFile(file)
    
    if (file) {
      // Crear nueva preview URL
      const newPreviewUrl = URL.createObjectURL(file)
      setProfilePhotoPreview(newPreviewUrl)
    }
  }

  const handleSaveWithPhoto = async () => {
    try {
      setLocalIsLoading(true)
      setLocalError(null)

      // Si hay una foto seleccionada, subirla primero
      if (profilePhotoFile) {
        await authService.uploadProfilePhoto(profilePhotoFile)
        
        // Limpiar el preview DESPUÉS de subir la foto
        if (profilePhotoPreview) {
          URL.revokeObjectURL(profilePhotoPreview)
          setProfilePhotoPreview(null)
        }
        setProfilePhotoFile(null)
        
        // Actualizar el contexto con el usuario que tiene la foto nueva
        if (refreshUser) await refreshUser()
      }
      
      // Llamar al save principal para guardar otros cambios
      await onSave()
      
    } catch (error: any) {
      console.error('Error saving user info:', error)
      setLocalError(error.response?.data?.message || 'Error al guardar la información')
    } finally {
      setLocalIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
            <UserCircleIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800">{error}</p>
        </motion.div>
      )}

      {localError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800">{localError}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-green-800">{success}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Photo Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Foto de Perfil
          </h3>
          {user && (
            <ProfilePhotoUpload
              user={user}
              onPhotoUpdated={refreshUser}
              size="lg"
              isEditing={isEditing}
              selectedFile={profilePhotoFile}
              onFileSelect={handlePhotoFileSelect}
              previewUrl={profilePhotoPreview}
            />
          )}
        </div>

        {/* First Name */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="h-4 w-4" />
            <span>Primer Nombre</span>
            <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu primer nombre"
              required
            />
          ) : (
            <p className="text-lg text-gray-900 py-2">{user?.firstName}</p>
          )}
        </div>

        {/* Second Name */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="h-4 w-4" />
            <span>Segundo Nombre</span>
            <span className="text-sm text-gray-500">(Opcional)</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu segundo nombre"
            />
          ) : (
            <p className="text-lg text-gray-900 py-2">{user?.middleName || 'No especificado'}</p>
          )}
        </div>

        {/* First Last Name */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="h-4 w-4" />
            <span>Primer Apellido</span>
            <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              name="firstLastName"
              value={formData.firstLastName}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu primer apellido"
              required
            />
          ) : (
            <p className="text-lg text-gray-900 py-2">{user?.firstLastName}</p>
          )}
        </div>

        {/* Second Last Name */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="h-4 w-4" />
            <span>Segundo Apellido</span>
            <span className="text-sm text-gray-500">(Opcional)</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              name="secondLastName"
              value={formData.secondLastName}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu segundo apellido"
            />
          ) : (
            <p className="text-lg text-gray-900 py-2">{user?.secondLastName || 'No especificado'}</p>
          )}
        </div>

        {/* Email - Editable solo cuando allowEmailEdit es true (admin) */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <span>📧</span>
            <span>Correo Electrónico</span>
            {allowEmailEdit && <span className="text-red-500">*</span>}
          </label>
          {isEditing && allowEmailEdit ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Correo electrónico"
              required
            />
          ) : (
            <>
              <p className="text-lg text-gray-900 py-2">{user?.email}</p>
              {!allowEmailEdit && (
                <p className="text-xs text-gray-400">No se puede modificar</p>
              )}
            </>
          )}
        </div>

        {/* Nueva Contraseña - Solo visible para administradores editando */}
        {isEditing && allowPasswordChange && (
          <div className="md:col-span-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <LockClosedIcon className="h-4 w-4" />
              <span>Nueva Contraseña</span>
              <span className="text-sm text-gray-500">(Opcional - Dejar vacío para mantener la actual)</span>
            </label>
            <div className="max-w-md">
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nueva contraseña"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres. Si no especificas una nueva contraseña, se mantendrá la actual.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isLoading || localIsLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>Cancelar</span>
          </button>
          <button
            onClick={profilePhotoFile ? handleSaveWithPhoto : onSave}
            disabled={isLoading || localIsLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {(isLoading || localIsLoading) ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
            <span>Guardar Cambios</span>
          </button>
        </div>
      )}

      {/* Change Password Section */}
      {!isEditing && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <LockClosedIcon className="h-5 w-5 mr-2" />
                Cambiar Contraseña
              </h3>
              <p className="text-sm text-gray-600">
                Actualiza tu contraseña periódicamente para mayor seguridad
              </p>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <LockClosedIcon className="h-4 w-4" />
              <span>Cambiar Contraseña</span>
            </button>
          </div>

          {/* Solo mostrar para admin: formulario de cambio de contraseña */}
          {allowPasswordChange && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Cambiar Contraseña de Usuario
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={onInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nueva contraseña"
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserInfoPanel
