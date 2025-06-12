import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  UserIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { clientService } from '../../services/clientService'
import { authService } from '../../services/authService'
import type { ClientProfile as ClientProfileType, CreateClientProfileRequest } from '../../types/index'
import ChangePassword from './ChangePassword'

const ClientProfile: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<ClientProfileType | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'user'>('user')
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    cedula: '',
    birthDate: '',
    phone: ''
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const profileData = await clientService.getMyProfile()
      setProfile(profileData)
      setHasProfile(true)
      setFormData({
        fullName: user.name,
        email: user.email,
        cedula: profileData.cedula,
        birthDate: profileData.birthDate.split('T')[0],
        phone: profileData.phone
      })
    } catch (error) {
      console.log('Profile not found, user needs to create one')
      setHasProfile(false)
      setFormData({
        fullName: user.name,
        email: user.email,
        cedula: '',
        birthDate: '',
        phone: ''
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // Validate required fields based on active tab
      if (activeTab === 'user') {
        if (!formData.fullName) {
          setError('El nombre es obligatorio')
          return
        }
        if (!hasProfile && (!formData.cedula || !formData.birthDate || !formData.phone)) {
          setError('Todos los campos son obligatorios para crear el perfil')
          return
        }
      }

      // Create or update profile
      const profileRequest: CreateClientProfileRequest = {
        identityId: user!.id,
        fullName: formData.fullName,
        cedula: formData.cedula,
        birthDate: formData.birthDate,
        phone: formData.phone
      }

      if (hasProfile) {
        // Update existing profile
        await clientService.updateMyProfile(profileRequest)
      } else {
        // Create new profile
        await clientService.createProfile(profileRequest)
      }

      // Update user name if changed
      if (formData.fullName !== user?.name) {
        await authService.updateProfile({ name: formData.fullName })
        await refreshUser()
      }

      setSuccess('Perfil actualizado correctamente')
      setIsEditing(false)
      await loadProfile()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setError(error.response?.data?.message || 'Error al guardar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setSuccess(null)
    if (hasProfile && profile) {
      setFormData({
        fullName: user!.name,
        email: user!.email,
        cedula: profile.cedula,
        birthDate: profile.birthDate.split('T')[0],
        phone: profile.phone
      })
    } else {
      setFormData({
        fullName: user?.name || '',
        email: user?.email || '',
        cedula: '',
        birthDate: '',
        phone: ''
      })
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurar Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y configuración de seguridad</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('user')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>Información Personal</span>
              </div>
            </button>
          </nav>
        </div>        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'user' && (
            <UserInfoTab
              user={user}
              profile={profile}
              hasProfile={hasProfile}
              isEditing={isEditing}
              formData={formData}
              error={error}
              success={success}
              isLoading={isLoading}
              showChangePassword={showChangePassword}
              onInputChange={handleInputChange}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
              setShowChangePassword={setShowChangePassword}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para información personal
interface UserInfoTabProps {
  user: any
  profile: ClientProfileType | null
  hasProfile: boolean
  isEditing: boolean
  formData: any
  error: string | null
  success: string | null
  isLoading: boolean
  showChangePassword: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  setShowChangePassword: (show: boolean) => void
}

const UserInfoTab: React.FC<UserInfoTabProps> = ({
  user, profile, hasProfile, isEditing, formData, error, success, isLoading, showChangePassword,
  onInputChange, onEdit, onSave, onCancel, setShowChangePassword
}) => {
  return (
    <>
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

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-green-800">{success}</p>
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
              <UserCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
              <p className="text-sm text-gray-600">
                {hasProfile ? 'Gestiona tu información personal' : 'Completa tu perfil para continuar'}
              </p>
            </div>
          </div>
          {hasProfile && !isEditing && (
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Editar</span>
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4" />
                <span>Nombre Completo</span>
              </label>
              {isEditing || !hasProfile ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu nombre completo"
                />
              ) : (
                <p className="text-lg text-gray-900 py-2">{user?.name}</p>
              )}
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span>📧</span>
                <span>Correo Electrónico</span>
              </label>
              <p className="text-lg text-gray-500 py-2">{user?.email}</p>
              <p className="text-xs text-gray-400">No se puede modificar</p>
            </div>

            {/* Cedula */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <IdentificationIcon className="h-4 w-4" />
                <span>Cédula</span>
              </label>
              {isEditing || !hasProfile ? (
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456789"
                />
              ) : (
                <p className="text-lg text-gray-900 py-2">{profile?.cedula}</p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>Fecha de Nacimiento</span>
              </label>
              {isEditing || !hasProfile ? (
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-lg text-gray-900 py-2">
                  {profile && new Date(profile.birthDate).toLocaleDateString('es-CO')}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-4 w-4" />
                <span>Teléfono</span>
              </label>
              {isEditing || !hasProfile ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+57 300 123 4567"
                />
              ) : (
                <p className="text-lg text-gray-900 py-2">{profile?.phone}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {(isEditing || !hasProfile) && (
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              {hasProfile && (
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              )}
              <button
                onClick={onSave}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
                <span>{hasProfile ? 'Guardar Cambios' : 'Crear Perfil'}</span>
              </button>
            </div>
          )}          {/* Profile Status */}
          {hasProfile && !isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckIcon className="h-4 w-4" />
                <span>Perfil completado</span>
              </div>
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
                  <p className="text-sm text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
                </div>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <LockClosedIcon className="h-4 w-4" />
                  <span>{showChangePassword ? 'Ocultar' : 'Cambiar Contraseña'}</span>
                </button>
              </div>
              
              {showChangePassword && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ChangePassword
                    onSuccess={() => {
                      setShowChangePassword(false)
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ClientProfile
