import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, UserIcon, WrenchScrewdriverIcon, IdentificationIcon, CalendarDaysIcon, PhoneIcon, ClockIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { authService } from '../../services/authService'
import { useToast } from '../common/ToastProvider'

interface RegisterProps {
  onSwitchToLogin: () => void
  onClose: () => void
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onClose }) => {
  const { showError, showSuccess } = useToast()
  const [isLoading, setIsLoading] = useState(false)
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
  }

  const handleRoleChange = (role: 'client' | 'technician') => {
    setFormData(prev => ({
      ...prev,
      role
    }))
  }
  
  const performRegister = async () => {
    setIsLoading(true)

    try {
      // Validaciones
      if (formData.password !== formData.confirmPassword) {
        showError('Error de validación', 'Las contraseñas no coinciden', 3000)
        return
      }

      if (formData.password.length < 6) {
        showError('Error de validación', 'La contraseña debe tener al menos 6 caracteres', 3000)
        return
      }

      // Validar campos según el rol
      if (!formData.cedula.trim() || !formData.birthDate) {
        showError('Error de validación', 'La cédula y fecha de nacimiento son obligatorios', 3000)
        return
      }

      if (formData.role === 'client' && !formData.phone.trim()) {
        showError('Error de validación', 'El teléfono es obligatorio para clientes', 3000)
        return
      }

      if (formData.role === 'technician') {
        if (formData.experienceYears < 0) {
          showError('Error de validación', 'Los años de experiencia no pueden ser negativos', 3000)
          return
        }
        if (!formData.idPhotoFile) {
          showError('Error de validación', 'La foto de cédula es obligatoria para técnicos', 3000)
          return
        }
      }

      // Validar correo electrónico
      try {
        const emailExists = await authService.checkEmailExists(formData.email)
        if (emailExists) {
          showError('Email ya registrado', 'El correo electrónico ya está registrado. Por favor utiliza otro correo o inicia sesión.', 4000)
          return
        }
      } catch (error) {
        // Continuar con el proceso de registro si hay un error en la verificación
      }

      // Llamar directamente al authService para registro
      const user = await authService.register({
        firstName: formData.firstName,
        middleName: formData.middleName,
        firstLastName: formData.firstLastName,
        secondLastName: formData.secondLastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      
      // Crear perfil según el rol
      if (formData.role === 'client') {
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
          specialties: [],
          idPhotoFile: formData.idPhotoFile || undefined
        })
      }

      // Hacer login automático después del registro exitoso
      const loginResult = await authService.login({ 
        email: formData.email, 
        password: formData.password 
      })

      // Actualizar localStorage y contexto
      localStorage.setItem('authToken', loginResult.token)
      localStorage.setItem('user', JSON.stringify(loginResult.user))
      
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { user: loginResult.user, token: loginResult.token } 
      }))

      showSuccess('¡Registro exitoso!', 'Tu cuenta ha sido creada. Bienvenido a MyHomeTech', 3000)
      
      onClose()
      window.location.href = '/dashboard'
      
    } catch (error: any) {
      if (error.response?.status === 409) {
        showError('Email ya registrado', 'El correo electrónico ya está registrado. Por favor utiliza otro correo o inicia sesión.', 4000)
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Error al registrar usuario'
        showError('Error de registro', errorMessage, 3000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    performRegister()
    return false
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