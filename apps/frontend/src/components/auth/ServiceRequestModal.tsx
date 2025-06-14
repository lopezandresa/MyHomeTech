import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { technicianService } from '../../services/technicianService'
import { serviceRequestService } from '../../services/serviceRequestService'
import type { Appliance } from '../../types/index'

interface ServiceRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth()
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    applianceId: '',
    description: '',
    clientPrice: '',
    validHours: '1'
  })

  // Validación temprana - si no es cliente autenticado, no renderizar nada
  if (!isAuthenticated || !user || user.role !== 'client') {
    return null
  }

  // Cargar electrodomésticos disponibles
  useEffect(() => {
    if (isOpen) {
      loadAppliances()
    }
  }, [isOpen])

  const loadAppliances = async () => {
    try {
      setIsLoading(true)
      const data = await technicianService.getAppliances()
      setAppliances(data)
    } catch (error) {
      console.error('Error loading appliances:', error)
      setError('Error al cargar tipos de electrodomésticos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated || !user) {
      setError('Debes estar autenticado para solicitar un servicio')
      return
    }

    if (user.role !== 'client') {
      setError('Solo los clientes pueden solicitar servicios')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const requestData = {
        applianceId: parseInt(formData.applianceId),
        description: formData.description,
        clientPrice: parseFloat(formData.clientPrice),
        validHours: parseInt(formData.validHours),
        addressId: 1, // TODO: Add address selection to form
        proposedDateTime: new Date().toISOString()
      }

      await serviceRequestService.createRequest(requestData)
      setSuccess(true)
      
      // Reset form
      setFormData({
        applianceId: '',
        description: '',
        clientPrice: '',
        validHours: '1'
      })

      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)

    } catch (error: any) {
      console.error('Error creating service request:', error)
      setError(error.response?.data?.message || 'Error al crear la solicitud de servicio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      applianceId: '',
      description: '',
      clientPrice: '',
      validHours: '1'
    })
    setError(null)
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Solicitar Servicio Técnico</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-800">
              ¡Solicitud creada exitosamente! Los técnicos podrán ver tu solicitud y contactarte.
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="applianceId" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de electrodoméstico *
            </label>
            {isLoading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                Cargando electrodomésticos...
              </div>
            ) : (
              <select
                id="applianceId"
                name="applianceId"
                value={formData.applianceId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Selecciona el electrodoméstico</option>
                {appliances.map((appliance) => (
                  <option key={appliance.id} value={appliance.id}>
                    {appliance.name} {appliance.brand && `- ${appliance.brand}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del problema *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Describe detalladamente el problema que presenta tu electrodoméstico..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Precio que ofreces (COP) *
              </label>
              <input
                type="number"
                id="clientPrice"
                name="clientPrice"
                value={formData.clientPrice}
                onChange={handleInputChange}
                required
                min="10000"
                step="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="50000"
              />
              <p className="text-xs text-gray-500 mt-1">Precio mínimo: $10,000 COP</p>
            </div>

            <div>
              <label htmlFor="validHours" className="block text-sm font-medium text-gray-700 mb-2">
                Vigencia de la oferta
              </label>
              <select
                id="validHours"
                name="validHours"
                value={formData.validHours}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="0.5">30 minutos</option>
                <option value="1">1 hora</option>
                <option value="2">2 horas</option>
                <option value="4">4 horas</option>
                <option value="8">8 horas</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Los técnicos especializados verán tu solicitud</li>
              <li>• Pueden aceptar tu precio o hacer una contraoferta</li>
              <li>• Tú decides qué técnico contratar</li>
              <li>• El servicio se realiza en tu domicilio</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando solicitud...
                </div>
              ) : (
                'Crear Solicitud'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ServiceRequestModal