import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  TrashIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { technicianService } from '../../services/technicianService'
import { authService } from '../../services/authService'
import type { TechnicianProfile as TechnicianProfileType, CreateTechnicianProfileRequest, ApplianceType } from '../../types/index'
import UserInfoPanel from '../common/UserInfoPanel'
import ChangePassword from './ChangePassword'
import DashboardTabs from '../common/DashboardTabs'
import DashboardSection from '../common/DashboardSection'
import { FormField, FormGrid, Input, FormActions } from '../common/DashboardForm'
import { formatDate, toInputDateFormat } from '../../utils/dateUtils'

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
        birthDate: toInputDateFormat(profileData.birthDate),
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
        birthDate: toInputDateFormat(profile.birthDate),
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
  }  return (
    <DashboardTabs
      title="Configurar Mi Perfil"
      subtitle="Gestiona tu información personal, profesional y configuración de seguridad"
      tabs={[
        {
          id: 'user',
          label: 'Información de Usuario',
          icon: UserIcon
        },
        {
          id: 'professional',
          label: 'Información Profesional',
          icon: WrenchScrewdriverIcon,
          subtitle: !hasProfile ? 'Completa tu perfil profesional' : undefined
        }
      ]}
      activeTab={activeTab}
      onTabChange={(tabId: string) => setActiveTab(tabId as 'user' | 'professional')}
      error={error}
      success={success}
      isLoading={isLoading}
    >
      {activeTab === 'user' && (
        <>
          <UserInfoPanel
            user={user}
            isEditing={isEditing}
            formData={formData}
            error={error}
            success={success}
            isLoading={isLoading}
            showChangePassword={showChangePassword}
            onInputChange={handleInputChange}
            onEdit={() => setIsEditing(true)}
            onSave={async () => {
              try {
                await authService.updateProfile({
                  firstName: formData.firstName,
                  middleName: formData.middleName,
                  firstLastName: formData.firstLastName,
                  secondLastName: formData.secondLastName
                });
                await refreshUser();
                setIsEditing(false);
                setSuccess('Información actualizada correctamente');
              } catch (error: any) {
                setError(error.response?.data?.message || 'Error al actualizar información');
              }
            }}
            onCancel={handleCancel}
            setShowChangePassword={setShowChangePassword}
            refreshUser={refreshUser}
            title="Información de Usuario"
            subtitle="Gestiona tu información básica de cuenta"
          />
          
          {/* Mostrar el componente ChangePassword cuando showChangePassword es true */}
          {showChangePassword && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <ChangePassword
                onSuccess={() => {
                  setShowChangePassword(false);
                  setSuccess('Contraseña actualizada correctamente');
                }}
                onCancel={() => {
                  setShowChangePassword(false);
                }}
              />
            </div>
          )}
        </>
      )}
      {activeTab === 'professional' && (        <ProfessionalInfoTab
          profile={profile}
          hasProfile={hasProfile}
          isEditing={isEditing}
          formData={formData}
          error={error}
          success={success}
          isLoading={isLoading}
          availableSpecialties={availableSpecialties}
          selectedFile={profilePhotoFile}
          previewUrl={profilePhotoPreview}
          onInputChange={handleInputChange}
          onFileChange={handleFileChange}
          onSpecialtyToggle={handleSpecialtyToggle}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onRemoveSpecialty={handleRemoveSpecialty}
          setShowSpecialtiesModal={setShowSpecialtiesModal}
        />
      )}

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
                  onClick={() => handleAddSpecialty(specialty.id)}
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
    </DashboardTabs>
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
  selectedFile: File | null
  previewUrl: string | null
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSpecialtyToggle: (specialtyId: number) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onRemoveSpecialty: (specialtyId: number) => void
  setShowSpecialtiesModal: (show: boolean) => void
}

const ProfessionalInfoTab: React.FC<ProfessionalInfoTabProps> = ({
  profile, hasProfile, isEditing, formData, error, success, isLoading,
  availableSpecialties, selectedFile, previewUrl, onInputChange, onFileChange, 
  onSpecialtyToggle, onEdit, onSave, onCancel, onRemoveSpecialty, setShowSpecialtiesModal
}) => {
  return (
    <DashboardSection
      title="Información Profesional"
      subtitle={hasProfile ? 'Actualiza tu información y especialidades' : 'Completa tu perfil profesional para continuar'}
      icon={WrenchScrewdriverIcon}
      error={error}
      success={success}
      canEdit={hasProfile}
      isEditing={isEditing}
      onEdit={onEdit}
    >
      <FormGrid>
        <FormField
          label="Cédula"
          icon={IdentificationIcon}
          required={!hasProfile}
        >
          {isEditing || !hasProfile ? (
            <Input
              name="cedula"
              value={formData.cedula}
              onChange={onInputChange}
              placeholder="123456789"
            />
          ) : (
            <p className="text-lg text-gray-900 py-2">{profile?.cedula}</p>
          )}
        </FormField>

        <FormField
          label="Fecha de Nacimiento"
          icon={CalendarDaysIcon}
          required={!hasProfile}
        >
          {isEditing || !hasProfile ? (
            <Input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={onInputChange}
            />
          ) : (
            <p className="text-lg text-gray-900 py-2">
              {profile && formatDate(profile.birthDate)}
            </p>
          )}
        </FormField>

        <FormField
          label="Años de Experiencia"
          icon={WrenchScrewdriverIcon}
          required={!hasProfile}
        >
          {isEditing || !hasProfile ? (
            <Input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={onInputChange}
              min="0"
              placeholder="5"
            />
          ) : (
            <p className="text-lg text-gray-900 py-2">{profile?.experienceYears} años</p>
          )}
        </FormField>

        <div className="md:col-span-2">
          <FormField
            label="Foto de Cédula"
            icon={CloudArrowUpIcon}
            required={!hasProfile}
          >
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
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <p className="text-lg text-gray-900 py-2 flex-1">
                    {profile?.idPhotoUrl ? 'Foto de cédula subida' : 'Sin foto de cédula'}
                  </p>
                  {profile?.idPhotoUrl && (
                    <span className="text-green-600 text-sm">✓ Archivo subido</span>
                  )}
                </div>
                
                {/* Previsualización de la foto de cédula existente */}
                {profile?.idPhotoUrl && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Foto de cédula actual:</p>
                    <img
                      src={profile.idPhotoUrl}
                      alt="Foto de cédula"
                      className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </FormField>
        </div>

        {/* Specialties Selection (for creation) */}
        {(!hasProfile && (isEditing || !hasProfile)) && (
          <div className="md:col-span-2">
            <FormField
              label="Seleccionar Especialidades"
              icon={WrenchScrewdriverIcon}
              required
            >
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
            </FormField>
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
      </FormGrid>

      <FormActions
        isEditing={isEditing}
        isLoading={isLoading}
        onSave={onSave}
        onCancel={onCancel}
        saveText={hasProfile ? 'Actualizar Perfil' : 'Crear Perfil'}
      />

      {/* Profile Status */}
      {hasProfile && !isEditing && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckIcon className="h-4 w-4" />
            <span>Perfil profesional completado</span>
          </div>
        </div>
      )}
    </DashboardSection>
  )
}

export default TechnicianProfile