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
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { technicianService } from '../../services/technicianService'
import { authService } from '../../services/authService'
import { addressService } from '../../services/addressService'
import type { TechnicianProfile as TechnicianProfileType, CreateTechnicianProfileRequest, ApplianceType, Address } from '../../types/index'
import ChangePassword from './ChangePassword'

const TechnicianProfile: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<TechnicianProfileType | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'user' | 'professional'>('user')
  const [showChangePassword, setShowChangePassword] = useState(false)  const [availableSpecialties, setAvailableSpecialties] = useState<ApplianceType[]>([])
  const [showSpecialtiesModal, setShowSpecialtiesModal] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressModal, setShowAddressModal] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    secondName: user?.secondName || '',
    firstLastName: user?.firstLastName || '',
    secondLastName: user?.secondLastName || '',
    email: user?.email || '',
    cedula: '',
    birthDate: '',
    experienceYears: 0,
    idPhotoFile: null as File | null,
    specialties: [] as number[],
    selectedAddressId: undefined as number | undefined
  })

  useEffect(() => {
    loadProfile()
    loadSpecialties()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const profileData = await technicianService.getMyProfile()
      setProfile(profileData)
      setHasProfile(true)
      setFormData({
        fullName: user.name,
        email: user.email,
        cedula: profileData.cedula,
        birthDate: profileData.birthDate.split('T')[0],
        experienceYears: profileData.experienceYears,
        idPhotoUrl: profileData.idPhotoUrl,
        specialties: profileData.specialties.map(s => s.id)
      })
    } catch (error) {
      console.log('Profile not found, user needs to create one')
      setHasProfile(false)
      setFormData({
        fullName: user.name,
        email: user.email,
        cedula: '',
        birthDate: '',
        experienceYears: 0,
        idPhotoUrl: '',
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
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
      if (activeTab === 'user') {
        if (!formData.fullName) {
          setError('El nombre es obligatorio')
          return
        }
      } else if (activeTab === 'professional') {
        if (!formData.cedula || !formData.birthDate || !formData.idPhotoUrl) {
          setError('Todos los campos profesionales son obligatorios')
          return
        }
      }

      // Create or update profile
      const profileRequest: CreateTechnicianProfileRequest = {
        identityId: user!.id,
        cedula: formData.cedula,
        birthDate: formData.birthDate,
        experienceYears: formData.experienceYears,
        idPhotoUrl: formData.idPhotoUrl,
        specialties: formData.specialties
      }

      if (hasProfile) {
        // Update existing profile
        await technicianService.updateMyProfile(profileRequest)
      } else {
        // Create new profile
        await technicianService.createProfile(profileRequest)
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
        experienceYears: profile.experienceYears,
        idPhotoUrl: profile.idPhotoUrl,
        specialties: profile.specialties.map(s => s.id)
      })
    } else {
      setFormData({
        fullName: user?.name || '',
        email: user?.email || '',
        cedula: '',
        birthDate: '',
        experienceYears: 0,
        idPhotoUrl: '',
        specialties: []
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
        <p className="text-gray-600">Gestiona tu información personal, profesional y configuración de seguridad</p>
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
        </div>        {/* Tab Content */}
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
              onSave={handleSave}
              onCancel={handleCancel}
              setShowChangePassword={setShowChangePassword}
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
              onInputChange={handleInputChange}
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
  onSave: () => void
  onCancel: () => void
  setShowChangePassword: (show: boolean) => void
}

const UserInfoTab: React.FC<UserInfoTabProps> = ({
  user, isEditing, formData, error, success, isLoading, showChangePassword,
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
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4" />
                <span>Nombre Completo</span>
              </label>
              {isEditing ? (
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
                onClick={onSave}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
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
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onAddSpecialty: (specialtyId: number) => void
  onRemoveSpecialty: (specialtyId: number) => void
  setShowSpecialtiesModal: (show: boolean) => void
}

const ProfessionalInfoTab: React.FC<ProfessionalInfoTabProps> = ({
  profile, hasProfile, isEditing, formData, error, success, isLoading,
  availableSpecialties, showSpecialtiesModal, onInputChange, onEdit, onSave, onCancel,
  onAddSpecialty, onRemoveSpecialty, setShowSpecialtiesModal
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">        {/* Header */}
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

            {/* ID Photo URL */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <PhotoIcon className="h-4 w-4" />
                <span>URL de Foto de Cédula</span>
              </label>
              {isEditing || !hasProfile ? (
                <input
                  type="url"
                  name="idPhotoUrl"
                  value={formData.idPhotoUrl}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://ejemplo.com/foto-cedula.jpg"
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <p className="text-lg text-gray-900 py-2 flex-1">{profile?.idPhotoUrl}</p>
                  {profile?.idPhotoUrl && (
                    <a
                      href={profile.idPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Ver imagen
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Specialties */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <WrenchScrewdriverIcon className="h-4 w-4" />
                  <span>Especialidades en Electrodomésticos</span>
                </label>
                {hasProfile && !isEditing && (
                  <button
                    onClick={() => setShowSpecialtiesModal(true)}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Agregar</span>
                  </button>
                )}
              </div>

              {hasProfile && profile?.specialties && profile.specialties.length > 0 ? (
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
          </div>          {/* Action Buttons */}
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
              <span>Guardar Perfil</span>
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