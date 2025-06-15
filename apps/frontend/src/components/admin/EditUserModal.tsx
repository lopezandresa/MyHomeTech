import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { AdminUserManagement } from '../../types'
import UserInfoPanel from '../common/UserInfoPanel'

interface EditUserModalProps {
  isOpen: boolean
  user: AdminUserManagement | null
  onClose: () => void
  onSave: (userId: number, userData: any) => Promise<void>
}

/**
 * Modal para editar información de usuario desde el panel de administrador
 * Reutiliza el componente UserInfoPanel para consistencia con otros perfiles
 */
const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    newPassword: '' // Agregar campo para nueva contraseña
  })

  // Actualizar formData cuando cambie el usuario
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        firstLastName: user.firstLastName || '',
        secondLastName: user.secondLastName || '',
        email: user.email || '',
        newPassword: '' // Siempre vacío al abrir el modal
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Apply capitalization to name fields
    const nameFields = ['firstName', 'middleName', 'firstLastName', 'secondLastName']
    const processedValue = nameFields.includes(name) 
      ? value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : value
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // Validaciones
      if (!formData.firstName.trim()) {
        setError('El primer nombre es obligatorio')
        return
      }
      if (!formData.firstLastName.trim()) {
        setError('El primer apellido es obligatorio')
        return
      }

      // Preparar datos para actualizar
      const updateData: any = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || null,
        firstLastName: formData.firstLastName.trim(),
        secondLastName: formData.secondLastName.trim() || null,
        email: formData.email.trim()
      }

      // Solo incluir contraseña si se proporcionó
      if (formData.newPassword && formData.newPassword.trim()) {
        if (formData.newPassword.length < 6) {
          setError('La nueva contraseña debe tener al menos 6 caracteres')
          return
        }
        updateData.password = formData.newPassword.trim()
      }

      await onSave(user.id, updateData)

      setSuccess('Usuario actualizado correctamente')
      
      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        onClose()
      }, 1500)
      
    } catch (error: any) {
      console.error('Error updating user:', error)
      setError(error.response?.data?.message || 'Error al actualizar el usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setError(null)
    setSuccess(null)
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        firstLastName: user.firstLastName || '',
        secondLastName: user.secondLastName || '',
        email: user.email || '',
        newPassword: '' // Limpiar el campo de contraseña al cancelar
      })
    }
    onClose()
  }

  if (!isOpen || !user) return null

  // Convertir AdminUserManagement a formato User para el UserInfoPanel
  const userForPanel = {
    id: user.id,
    firstName: user.firstName,
    middleName: user.middleName,
    firstLastName: user.firstLastName,
    secondLastName: user.secondLastName,
    email: user.email,
    role: user.role,
    status: user.status,
    profilePhotoUrl: user.profilePhotoUrl,
    get fullName() {
      return `${this.firstName} ${this.middleName || ''} ${this.firstLastName} ${this.secondLastName || ''}`.trim()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Usuario</h2>
              <p className="text-sm text-gray-600 mt-1">
                Editando información de {user.firstName} {user.firstLastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <UserInfoPanel
              user={userForPanel}
              isEditing={true}
              formData={formData}
              error={error}
              success={success}
              isLoading={isLoading}
              showChangePassword={false}
              onInputChange={handleInputChange}
              onEdit={() => {}} // No needed since we're always in edit mode
              onSave={handleSave}
              onCancel={handleCancel}
              setShowChangePassword={() => {}} // Disabled in admin edit mode
              title="Información del Usuario"
              subtitle="Edita la información básica del usuario"
              allowEmailEdit={true} // Permitir edición de email desde panel de admin
              allowPasswordChange={true} // Permitir cambio de contraseña desde panel de admin
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EditUserModal