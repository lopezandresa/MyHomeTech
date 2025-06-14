import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon, UserIcon, WrenchScrewdriverIcon, IdentificationIcon, CalendarDaysIcon, PhoneIcon, ClockIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

interface RegisterProps {
  onSwitchToLogin: () => void
  onClose: () => void
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onClose }) => {
  const { register, login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<{
    firstName: string
    middleName: string
    firstLastName: string
    secondLastName: string
    email: string
    password: string
    confirmPassword: string
    role: 'client' | 'technician'
    // Campos adicionales para cliente
    cedula: string
    birthDate: string
    phone: string
    // Campos adicionales para técnico
    experienceYears: number
    idPhotoFile?: File | null
  }>({
    firstName: '',
    middleName: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    cedula: '',
    birthDate: '',
    phone: '',
    experienceYears: 0,
    idPhotoFile: null
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    // Apply capitalization to name fields
    const nameFields = ['firstName', 'middleName', 'firstLastName', 'secondLastName']
    let processedValue: any = value
    
    if (nameFields.includes(name)) {
      processedValue = capitalizeName(value, name.includes('LastName'))
    } else if (type === 'number') {
      processedValue = parseInt(value) || 0
    } else if (type === 'file') {
      processedValue = e.target.files?.[0] || null
      setFormData(prev => ({
        ...prev,
        idPhotoFile: processedValue
      }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    if (error) setError(null)
  }

  const handleRoleChange = (role: 'client' | 'technician') => {
    setFormData(prev => ({
      ...prev,
      role
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    // Validar campos según el rol
    if (!formData.cedula.trim() || !formData.birthDate) {
      setError('La cédula y fecha de nacimiento son obligatorios')
      return
    }

    if (formData.role === 'client' && !formData.phone.trim()) {
      setError('El teléfono es obligatorio para clientes')
      return
    }

    if (formData.role === 'technician') {
      if (formData.experienceYears < 0) {
        setError('Los años de experiencia no pueden ser negativos')
        return
      }
      if (!formData.idPhotoFile) {
        setError('La foto de cédula es obligatoria para técnicos')
        return
      }
    }

    // Validar correo electrónico
    try {
      const { authService } = await import('../../services/authService')
      const emailExists = await authService.checkEmailExists(formData.email)
      if (emailExists) {
        setError('El correo electrónico ya está registrado. Por favor utiliza otro correo o inicia sesión.')
        return
      }
    } catch (error) {
      console.error('Error al verificar email:', error)
      // Continuar con el proceso de registro si hay un error en la verificación
    }

    try {
      // Enviar datos básicos de usuario
      const user = await register(
        formData.firstName, 
        formData.middleName, 
        formData.firstLastName, 
        formData.secondLastName, 
        formData.email, 
        formData.password, 
        formData.role
      )
      
      // Crear perfil según el rol
      if (formData.role === 'client') {
        // Importar clientService y crear perfil de cliente
        const { clientService } = await import('../../services/clientService')
        await clientService.createProfile({
          identityId: user.id,
          fullName: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.firstLastName} ${formData.secondLastName || ''}`.trim(),
          cedula: formData.cedula,
          birthDate: formData.birthDate,
          phone: formData.phone
        })
      } else if (formData.role === 'technician') {
        const { technicianService } = await import('../../services/technicianService')
        await technicianService.createProfile({
          identityId: user.id,
          cedula: formData.cedula,
          birthDate: formData.birthDate,
          experienceYears: formData.experienceYears,
          specialties: [], // El técnico puede actualizar esto después
          idPhotoFile: formData.idPhotoFile || undefined
        })
      }

      // Hacer login automático después del registro exitoso
      await login(formData.email, formData.password)
      onClose()
      // Redirigir al dashboard después del registro exitoso
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      console.error('Register error:', error)
      if (error.response?.status === 409) {
        setError('El correo electrónico ya está registrado. Por favor utiliza otro correo o inicia sesión.')
      } else {
        setError(error.response?.data?.message || 'Error al registrar usuario')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img 
            src="/MyHomeTech-Logo-1.svg" 
            alt="MyHomeTech" 
            className="h-14 w-14"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            MyHomeTech
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
        <p className="text-gray-600 mt-2">Únete a la comunidad MyHomeTech</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800 text-sm">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de tipo de usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de cuenta
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleChange('client')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.role === 'client'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <UserIcon className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Cliente</div>
              <div className="text-xs text-gray-500">Solicitar servicios</div>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('technician')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.role === 'technician'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <WrenchScrewdriverIcon className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Técnico</div>
              <div className="text-xs text-gray-500">Ofrecer servicios</div>
            </button>
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Primer Nombre *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu primer nombre"
            />
          </div>
          
          <div>
            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
              Segundo Nombre
            </label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu segundo nombre (opcional)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstLastName" className="block text-sm font-medium text-gray-700 mb-1">
              Primer Apellido *
            </label>
            <input
              type="text"
              id="firstLastName"
              name="firstLastName"
              value={formData.firstLastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu primer apellido"
            />
          </div>
          
          <div>
            <label htmlFor="secondLastName" className="block text-sm font-medium text-gray-700 mb-1">
              Segundo Apellido
            </label>
            <input
              type="text"
              id="secondLastName"
              name="secondLastName"
              value={formData.secondLastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu segundo apellido (opcional)"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Campos específicos según el rol */}
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-4">
            {formData.role === 'client' ? 'Información del Cliente' : 'Información del Técnico'}
          </h3>
          
          {/* Campos comunes para ambos roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                Cédula *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. 123456789"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                </div>                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>
          </div>
          
          {/* Campos específicos para cliente */}
          {formData.role === 'client' && (
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. 300 123 4567"
                />
              </div>
            </div>
          )}
          
          {/* Campos específicos para técnico */}
          {formData.role === 'technician' && (
            <>
              <div className="mb-4">
                <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">
                  Años de Experiencia *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="experienceYears"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="50"
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej. 5"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="idPhotoFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Foto de Cédula *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CloudArrowUpIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    id="idPhotoFile"
                    name="idPhotoFile"
                    accept="image/*"
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sube una foto de tu cédula para verificar tu identidad. Formatos: JPG, PNG. Tamaño máximo: 5MB.
                </p>
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creando cuenta...
            </div>
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </motion.div>
  )
}

export default Register