import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { authService } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'
import type { User } from '../../types/index'
import UserAvatar from './UserAvatar'

interface ProfilePhotoUploadProps {
  user: User
  onPhotoUpdated?: (updatedUser: User) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isEditing?: boolean
  selectedFile?: File | null
  onFileSelect?: (file: File | null) => void
  previewUrl?: string | null
  showUploadButton?: boolean
  autoUpload?: boolean // Nueva prop para controlar subida automática
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  user,
  onPhotoUpdated,
  size = 'xl',
  isEditing = false,
  selectedFile,
  onFileSelect,
  previewUrl,
  showUploadButton = false,
  autoUpload = false // Por defecto false para no subir automáticamente
}) => {
  const { refreshUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Crear un usuario temporal para mostrar la preview SOLO localmente
  const userWithPreview = previewUrl 
    ? { ...user, profilePhotoUrl: previewUrl }
    : user

  const handleAvatarClick = () => {
    if (!isEditing) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)
    
    if (!file) {
      onFileSelect?.(null)
      return
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      setError('Solo se permiten archivos de imagen (JPG, PNG, GIF)')
      return
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no puede ser mayor a 5MB')
      return
    }

    onFileSelect?.(file)
    
    // Solo subir automáticamente si autoUpload está habilitado
    if (autoUpload) {
      handleUpload(file)
    }
  }

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile
    if (!fileToUpload) return

    try {
      setIsUploading(true)
      setError(null)

      // Subir la foto
      const updatedUser = await authService.uploadProfilePhoto(fileToUpload)
      
      // Refrescar el contexto de autenticación para actualizar toda la app
      await refreshUser()
      
      // Callback opcional
      if (onPhotoUpdated) {
        onPhotoUpdated(updatedUser)
      }

      // Limpiar archivo seleccionado
      if (onFileSelect) {
        onFileSelect(null)
      }

    } catch (error: any) {
      console.error('Error uploading photo:', error)
      setError(error.response?.data?.message || 'Error al subir la foto')
    } finally {
      setIsUploading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Avatar interactivo */}
      <div className="flex flex-col items-center space-y-4">
        <UserAvatar
          user={userWithPreview}
          size={size}
          editable={isEditing}
          onEditClick={handleAvatarClick}
          isUploading={isUploading}
        />
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Foto de Perfil</h3>
          {isEditing ? (
            <>
              <p className="text-sm text-gray-500">
                Haz clic en la imagen para cambiar tu foto
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG o GIF. Máximo 5MB
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Activa el modo edición para cambiar tu foto
            </p>
          )}
        </div>
      </div>

      {/* Mostrar nombre del archivo seleccionado */}
      {selectedFile && isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <CheckIcon className="h-5 w-5 text-blue-600" />
            <span className="text-blue-700 text-sm">
              Archivo seleccionado: {selectedFile.name}
            </span>
          </div>
          <button
            onClick={() => onFileSelect?.(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Mostrar aviso de cambios pendientes */}
      {selectedFile && isEditing && !autoUpload && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <p className="text-yellow-800 text-sm">
            📷 Se actualizará tu foto cuando guardes los cambios
          </p>
        </motion.div>
      )}

      {/* Botón de subir (solo si showUploadButton es true) */}
      {showUploadButton && selectedFile && isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={() => handleUpload()}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CloudArrowUpIcon className="h-4 w-4" />
            )}
            <span>{isUploading ? 'Subiendo...' : 'Subir Foto'}</span>
          </button>
        </motion.div>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfilePhotoUpload