import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  UserIcon,
  LockClosedIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { technicianService } from '../../services/technicianService'
import { authService } from '../../services/authService'
import type { TechnicianProfile as TechnicianProfileType, CreateTechnicianProfileRequest, ApplianceType } from '../../types/index'
import ChangePassword from './ChangePassword'
import ProfilePhotoUpload from '../common/ProfilePhotoUpload'

const TechnicianProfile: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<TechnicianProfileType | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'user' | 'professional'>('user')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [availableSpecialties, setAvailableSpecialties] = useState<ApplianceType[]>([])
  const [showSpecialtiesModal, setShowSpecialtiesModal] = useState(false)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)

  // Form data - now with separate name fields
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    firstLastName: user?.firstLastName || '',
    secondLastName: user?.secondLastName || '',
    email: user?.email || '',
    cedula: '',
    birthDate: '',
    experienceYears: 0,
    specialties: [] as number[]
  })

  useEffect(() => {
    loadProfile()
    loadSpecialties()
  }, [user])

  useEffect(() => {
    // Cleanup preview URL when component unmounts or file changes
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview)
      }
    }
  }, [profilePhotoPreview])

  const loadProfile = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const profileData = await technicianService.getMyProfile()
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
        experienceYears: profileData.experienceYears,
        specialties: profileData.specialties.map(s => s.id)
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
        experienceYears: 0,
        specialties: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSpecialties = async () => {
    try {
      const specialties = await technicianService.getApplianceTypes()
      setAvailableSpecialties(specialties)
    } catch (error) {
      console.error('Error loading specialties:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    // Apply capitalization to name fields
    const nameFields = ['firstName', 'middleName', 'firstLastName', 'secondLastName']
    const processedValue = nameFields.includes(name) 
      ? capitalizeName(value, name === 'firstLastName' || name === 'secondLastName') 
      : (type === 'number' ? parseInt(value) || 0 : value)
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

      setProfilePhotoFile(file)
      
      // Create preview URL
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview)
      }
      const newPreviewUrl = URL.createObjectURL(file)
      setProfilePhotoPreview(newPreviewUrl)
      setError(null)
    }
  }

  const handleSpecialtyToggle = (specialtyId: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter(id => id !== specialtyId)
        : [...prev.specialties, specialtyId]
    }))
  }

  const handleAddSpecialty = async (specialtyId: number) => {
    try {
      setError(null)
      await technicianService.addSpecialty(specialtyId)
      await loadProfile()
      setSuccess('Especialidad agregada correctamente')
      setShowSpecialtiesModal(false)
    } catch (error: any) {
      console.error('Error adding specialty:', error)
      setError(error.response?.data?.message || 'Error al agregar especialidad')
    }
  }

  const handleRemoveSpecialty = async (specialtyId: number) => {
    try {
      setError(null)
      await technicianService.removeSpecialty(specialtyId)
      await loadProfile()
      setSuccess('Especialidad removida correctamente')
    } catch (error: any) {
      console.error('Error removing specialty:', error)
      setError(error.response?.data?.message || 'Error al remover especialidad')
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // Validate required fields based on active tab
      if (activeTab === 'professional') {
        if (!formData.cedula.trim()) {
          setError('La cédula es obligatoria')
          return
        }
        if (!formData.birthDate) {
          setError('La fecha de nacimiento es obligatoria')
          return
        }
        if (!hasProfile && formData.specialties.length === 0) {
          setError('Debes seleccionar al menos una especialidad')
          return
        }
        if (!hasProfile && !profilePhotoFile) {
          setError('Debes subir una foto de tu cédula')
          return
        }
      }

      // Create or update profile (only for professional tab)
      if (activeTab === 'professional') {
        const profileRequest: CreateTechnicianProfileRequest = {
          identityId: user!.id,
          cedula: formData.cedula.trim(),
          birthDate: formData.birthDate,
          experienceYears: Number(formData.experienceYears) || 0,
          specialties: formData.specialties,
          idPhotoFile: profilePhotoFile || undefined
        }

        if (hasProfile) {
          // Update existing profile
          await technicianService.updateMyProfile(profileRequest)
        } else {
          // Create new profile
          await technicianService.createProfile(profileRequest)
        }

        setSuccess('Perfil profesional actualizado correctamente')
        await loadProfile()
      }

      setIsEditing(false)
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
    setProfilePhotoFile(null)
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview)
      setProfilePhotoPreview(null)
    }
    
    if (hasProfile && profile) {
      setFormData({
        firstName: user!.firstName,
        middleName: user!.middleName || '',
        firstLastName: user!.firstLastName,
        secondLastName: user!.secondLastName || '',
        email: user!.email,
        cedula: profile.cedula,
        birthDate: profile.birthDate.split('T')[0],
        experienceYears: profile.experienceYears,
        specialties: profile.specialties.map(s => s.id)
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
        experienceYears: 0,
        specialties: []
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
        <p className="text-gray-600">Gestiona tu información personal, profesional y configuración de seguridad</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
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
                <span>Información de Usuario</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'professional'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <WrenchScrewdriverIcon className="h-4 w-4" />
                <span>Información Profesional</span>
                {!hasProfile && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'user' && (
            <UserInfoTab
              user={user}
              isEditing={isEditing}
              formData={formData}
              error={error}
              success={success}
              isLoading={isLoading}
              showChangePassword={showChangePassword}
              onInputChange={handleInputChange}
              onEdit={() => setIsEditing(true)}
              onCancel={handleCancel}
              setShowChangePassword={setShowChangePassword}
              onPhotoUpdated={refreshUser}
              setSuccess={setSuccess}
            />
          )}
          {activeTab === 'professional' && (
            <ProfessionalInfoTab
              profile={profile}
              hasProfile={hasProfile}
              isEditing={isEditing}
              formData={formData}
              error={error}
              success={success}
              isLoading={isLoading}
              availableSpecialties={availableSpecialties}
              showSpecialtiesModal={showSpecialtiesModal}
              selectedFile={profilePhotoFile}
              previewUrl={profilePhotoPreview}
              onInputChange={handleInputChange}
              onFileChange={handleFileChange}
              onSpecialtyToggle={handleSpecialtyToggle}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
              onAddSpecialty={handleAddSpecialty}
              onRemoveSpecialty={handleRemoveSpecialty}
              setShowSpecialtiesModal={setShowSpecialtiesModal}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para información de usuario
interface UserInfoTabProps {
  user: any
  isEditing: boolean
  formData: any
  error: string | null
  success: string | null
  isLoading: boolean
  showChangePassword: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEdit: () => void
  onCancel: () => void
  setShowChangePassword: (show: boolean) => void
  onPhotoUpdated?: (updatedUser: any) => void
  setSuccess?: (message: string | null) => void
}

const UserInfoTab: React.FC<UserInfoTabProps> = ({
  user, isEditing, formData, error, success, isLoading, showChangePassword,
  onInputChange, onEdit, onCancel, setShowChangePassword, onPhotoUpdated, setSuccess
}) => {
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [localIsLoading, setLocalIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Cleanup preview URL when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview)
      }
    }
  }, [profilePhotoPreview])

  const handlePhotoFileSelect = (file: File | null) => {
    // Cleanup previous preview URL
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview)
      setProfilePhotoPreview(null)
    }

    setProfilePhotoFile(file)
    
    if (file) {
      // Create new preview URL
      const newPreviewUrl = URL.createObjectURL(file)
      setProfilePhotoPreview(newPreviewUrl)
    }
  }

  const handleSaveWithPhoto = async () => {
    try {
      setLocalIsLoading(true)
      setLocalError(null)
      if (setSuccess) setSuccess(null)

      // Si hay una foto seleccionada, subirla primero
      if (profilePhotoFile) {
        const updatedUser = await authService.uploadProfilePhoto(profilePhotoFile)
        
        // IMPORTANTE: Limpiar el preview ANTES de actualizar el contexto
        if (profilePhotoPreview) {
          URL.revokeObjectURL(profilePhotoPreview)
          setProfilePhotoPreview(null)
        }
        setProfilePhotoFile(null)
        
        // Ahora actualizar el contexto con el usuario que tiene la foto real
        if (onPhotoUpdated) onPhotoUpdated(updatedUser)
      }
      
      // Actualizar nombre si cambió
      if (formData.firstName !== user?.firstName || formData.middleName !== user?.middleName || formData.firstLastName !== user?.firstLastName || formData.secondLastName !== user?.secondLastName) {
        await authService.updateProfile({ 
          firstName: formData.firstName, 
          middleName: formData.middleName, // Cambiar secondName por middleName
          firstLastName: formData.firstLastName, 
          secondLastName: formData.secondLastName 
        })
      }
      
      // Refrescar el usuario para asegurar que se actualice en toda la app
      const refreshedUser = await authService.getProfile()
      
      if (onPhotoUpdated) {
        onPhotoUpdated(refreshedUser)
      }

      if (setSuccess) setSuccess('Información de usuario actualizada correctamente')
      
      // Salir del modo edición
      setTimeout(() => {
        onCancel() // Esto cambiará isEditing a false
      }, 1000)
      
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
      {(error || localError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800">{error || localError}</p>
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
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Información de Usuario</h2>
              <p className="text-sm text-gray-600">Gestiona tu información básica de cuenta</p>
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
                  onPhotoUpdated={onPhotoUpdated}
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

            {/* Middle Name */}
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

            {/* Email (readonly) */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span>📧</span>
                <span>Correo Electrónico</span>
              </label>
              <p className="text-lg text-gray-500 py-2">{user?.email}</p>
              <p className="text-xs text-gray-400">No se puede modificar</p>
            </div>
          </div>          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSaveWithPhoto}
                disabled={localIsLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {localIsLoading ? (
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

// Componente para información profesional
interface ProfessionalInfoTabProps {
  profile: TechnicianProfileType | null
  hasProfile: boolean
  isEditing: boolean
  formData: any
  error: string | null
  success: string | null
  isLoading: boolean
  availableSpecialties: ApplianceType[]
  showSpecialtiesModal: boolean
  selectedFile: File | null
  previewUrl: string | null
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSpecialtyToggle: (specialtyId: number) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onAddSpecialty: (specialtyId: number) => void
  onRemoveSpecialty: (specialtyId: number) => void
  setShowSpecialtiesModal: (show: boolean) => void
}

const ProfessionalInfoTab: React.FC<ProfessionalInfoTabProps> = ({
  profile, hasProfile, isEditing, formData, error, success, isLoading,
  availableSpecialties, showSpecialtiesModal, selectedFile, previewUrl, onInputChange, onFileChange, 
  onSpecialtyToggle, onEdit, onSave, onCancel, onAddSpecialty, onRemoveSpecialty, setShowSpecialtiesModal
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
              <WrenchScrewdriverIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                Información Profesional
                {!hasProfile && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 ml-2" />
                )}
              </h2>
              <p className="text-sm text-gray-600">
                {hasProfile ? 'Actualiza tu información y especialidades' : 'Completa tu perfil profesional para continuar'}
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

            {/* Experience Years */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <WrenchScrewdriverIcon className="h-4 w-4" />
                <span>Años de Experiencia</span>
              </label>
              {isEditing || !hasProfile ? (
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={onInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5"
                />
              ) : (
                <p className="text-lg text-gray-900 py-2">{profile?.experienceYears} años</p>
              )}
            </div>

            {/* ID Photo Upload */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>Foto de Cédula</span>
              </label>
              {isEditing || !hasProfile ? (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {selectedFile && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckIcon className="h-5 w-5 text-green-600" />
                      <span className="text-green-700">Archivo seleccionado: {selectedFile.name}</span>
                    </div>
                  )}
                  {previewUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <p className="text-lg text-gray-900 py-2 flex-1">
                    {profile?.idPhotoPath ? 'Foto de cédula subida' : 'Sin foto de cédula'}
                  </p>
                  {profile?.idPhotoPath && (
                    <span className="text-green-600 text-sm">✓ Archivo subido</span>
                  )}
                </div>
              )}
            </div>

            {/* Specialties Selection (for creation) */}
            {(!hasProfile && (isEditing || !hasProfile)) && (
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                  <WrenchScrewdriverIcon className="h-4 w-4" />
                  <span>Seleccionar Especialidades</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableSpecialties.map(specialty => (
                    <label
                      key={specialty.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty.id)}
                        onChange={() => onSpecialtyToggle(specialty.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{specialty.name}</p>
                        {specialty.description && (
                          <p className="text-xs text-gray-500 truncate">{specialty.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selecciona las especialidades en las que tienes experiencia
                </p>
              </div>
            )}

            {/* Existing Specialties (for updates) */}
            {hasProfile && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <WrenchScrewdriverIcon className="h-4 w-4" />
                    <span>Especialidades en Electrodomésticos</span>
                  </label>
                  {!isEditing && (
                    <button
                      onClick={() => setShowSpecialtiesModal(true)}
                      className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Agregar</span>
                    </button>
                  )}
                </div>

                {profile?.specialties && profile.specialties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {profile.specialties.map(specialty => (
                      <div
                        key={specialty.id}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <CheckIcon className="h-4 w-4 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{specialty.name}</p>
                            {specialty.description && (
                              <p className="text-xs text-gray-500">{specialty.description}</p>
                            )}
                          </div>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => onRemoveSpecialty(specialty.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tienes especialidades asignadas</p>
                    <p className="text-sm text-gray-400">Agrega especialidades para recibir trabajos específicos</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            {isEditing && hasProfile && (
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
              <span>{hasProfile ? 'Actualizar Perfil' : 'Crear Perfil'}</span>
            </button>
          </div>

          {/* Profile Status */}
          {hasProfile && !isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckIcon className="h-4 w-4" />
                <span>Perfil profesional completado</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar especialidades */}
      {showSpecialtiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Agregar Especialidad</h3>
            <p className="text-gray-600 mb-6">
              Selecciona un tipo de electrodoméstico para agregar a tus especialidades
            </p>
            
            <div className="space-y-2 mb-6">
              {availableSpecialties
                .filter(specialty => !profile?.specialties.some(ps => ps.id === specialty.id))
                .map(specialty => (
                <button
                  key={specialty.id}
                  onClick={() => onAddSpecialty(specialty.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <p className="font-medium text-gray-900">{specialty.name}</p>
                  {specialty.description && (
                    <p className="text-sm text-gray-500">{specialty.description}</p>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSpecialtiesModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default TechnicianProfile