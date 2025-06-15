import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { authService } from '../../services/authService'
import { useToast } from '../common/ToastProvider'

interface LoginProps {
  onSwitchToRegister: () => void
  onClose: () => void
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onClose }) => {
  const { showError } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const performLogin = async () => {
    setIsLoading(true)
    
    try {
      // Llamar directamente al authService sin usar el contexto
      const result = await authService.login({ 
        email: formData.email, 
        password: formData.password 
      })
      
      // Si llegamos aquí, el login fue exitoso
      // Forzar actualización inmediata del localStorage para que ProtectedRoute funcione
      localStorage.setItem('authToken', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      
      // Actualizar el contexto manualmente
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { user: result.user, token: result.token } 
      }))
      
      onClose()
      // Usar window.location.href para forzar navegación
      window.location.href = '/dashboard'
      
    } catch (error: any) {
      // Mostrar error con toast en lugar del banner
      const errorMessage = error.message || 'Error al iniciar sesión'
      showError('Error de autenticación', errorMessage, 2500)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
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
        <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
        <p className="text-gray-600 mt-2">Accede a tu cuenta para continuar</p>
      </div>

      <div className="space-y-6">
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
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  performLogin()
                }
              }}
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

        <button
          type="button"
          onClick={performLogin}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </div>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </motion.div>
  )
}

export default Login