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
import ProfilePhotoUpload from '../common/ProfilePhotoUpload'
import AddressManagement from '../common/AddressManagement'

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

  // Form data - now with separate name fields
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    firstLastName: user?.firstLastName || '',
    secondLastName: user?.secondLastName || '',
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
        firstName: user.firstName,
        middleName: user.middleName || '',
        firstLastName: user.firstLastName,
        secondLastName: user.secondLastName || '',
        email: user.email,
        cedula: profileData.cedula,
        birthDate: profileData.birthDate.split('T')[0],
        phone: profileData.phone
      })
    } catch (error) {
      setHasProfile(false)
      setFormData({
        firstName: user?.firstName || '',
        middleName: user?.middleName || '',
        firstLastName: user?.firstLastName || '',
        secondLastName: user?.secondLastName || '',
        email: user?.email || '',
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
    
    // Apply capitalization to name fields
    const nameFields = ['firstName', 'middleName', 'firstLastName', 'secondLastName']
    const processedValue = nameFields.includes(name) ? capitalizeName(value, name.includes('LastName')) : value
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // Validate required fields
      if (!formData.firstName.trim()) {
        setError('El primer nombre es obligatorio')
        return
      }
      if (!formData.firstLastName.trim()) {
        setError('El primer apellido es obligatorio')
        return
      }
      if (!hasProfile && (!formData.cedula || !formData.birthDate || !formData.phone)) {
        setError('La cédula, fecha de nacimiento y teléfono son obligatorios para crear el perfil')
        return
      }

      // Update user name fields if changed
      if (formData.firstName !== user?.firstName || 
          formData.middleName !== user?.middleName || 
          formData.firstLastName !== user?.firstLastName || 
          formData.secondLastName !== user?.secondLastName) {
        await authService.updateProfile({ 
          firstName: formData.firstName,
          middleName: formData.middleName, // Cambiar secondName por middleName
          firstLastName: formData.firstLastName,
          secondLastName: formData.secondLastName
        })
        await refreshUser()
      }

      // Create or update profile
      const profileRequest: CreateClientProfileRequest = {
        identityId: user!.id,
        fullName: `${formData.firstName} ${formData.middleName || ''} ${formData.firstLastName} ${formData.secondLastName || ''}`.trim().replace(/\s+/g, ' '),
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
        firstName: user!.firstName,
        middleName: user!.middleName || '',
        firstLastName: user!.firstLastName,
        secondLastName: user!.secondLastName || '',
        email: user!.email,
        cedula: profile.cedula,
        birthDate: profile.birthDate.split('T')[0],
        phone: profile.phone
      })
    } else {
      setFormData({
        firstName: user?.firstName || '',
        middleName: user?.middleName || '',
        firstLastName: user?.firstLastName || '',
        secondLastName: user?.secondLastName || '',
        email: user?.email || '',
        cedula: '',
        birthDate: '',
        phone: ''
      })
    }
  }

  // Utility function to capitalize names
  const capitalizeName = (name: string, isLastName: boolean = false): string => {
    const capitalized = name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // Only remove extra spaces for first and middle names, preserve spaces in last names
    return isLastName ? capitalized : capitalized.replace(/\s+/g, ' ').trim()
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
              refreshUser={refreshUser}
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
  refreshUser?: () => void
}

const UserInfoTab: React.FC<UserInfoTabProps> = ({
  user, profile, hasProfile, isEditing, formData, error, success, isLoading, showChangePassword,
  onInputChange, onEdit, onSave, onCancel, setShowChangePassword, refreshUser
}) => {
  // Estados para manejo de foto de perfil
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [localIsLoading, setLocalIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Limpiar preview URL cuando el componente se desmonta o cambian los archivos
  React.useEffect(() => {
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
        const updatedUser = await authService.uploadProfilePhoto(profilePhotoFile)
        
        // Limpiar el preview ANTES de actualizar el contexto
        if (profilePhotoPreview) {
          URL.revokeObjectURL(profilePhotoPreview)
          setProfilePhotoPreview(null)
        }
        setProfilePhotoFile(null)
        
        // Actualizar el contexto con el usuario que tiene la foto real
        if (refreshUser) refreshUser()
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

            {/* Address Management Section */}
            <div className="md:col-span-2">
              <AddressManagement isEditing={isEditing} />
            </div>

            {/* First Name */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4" />
                <span>Primer Nombre</span>
                <span className="text-red-500">*</span>
              </label>
              {isEditing || !hasProfile ? (
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
              {isEditing || !hasProfile ? (
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
              {isEditing || !hasProfile ? (
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
              {isEditing || !hasProfile ? (
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
                onClick={profilePhotoFile ? handleSaveWithPhoto : onSave}
                disabled={isLoading || localIsLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {(isLoading || localIsLoading) ? (
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
