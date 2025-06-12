import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { applianceService } from '../services/applianceService'
import { serviceRequestService } from '../services/serviceRequestService'
import type { Appliance } from '../types/index'

interface ServiceRequestFormProps {
  onSuccess?: (newRequest?: any) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({ onSuccess, onError, onCancel }) => {
  // Datos de la cascada
  const [types, setTypes] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  
  // Selecciones del usuario
  const [selectedType, setSelectedType] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null)
  
  // Datos del formulario
  const [description, setDescription] = useState('')
  const [clientPrice, setClientPrice] = useState('')
  
  // Estados de la UI
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Cargar tipos al montar el componente
  useEffect(() => {
    loadTypes()
  }, [])

  // Cargar marcas cuando se selecciona un tipo
  useEffect(() => {
    if (selectedType) {
      loadBrands(selectedType)
      setSelectedBrand('')
      setSelectedModel('')
      setSelectedAppliance(null)
    }
  }, [selectedType])

  // Cargar modelos cuando se selecciona una marca
  useEffect(() => {
    if (selectedType && selectedBrand) {
      loadModels(selectedType, selectedBrand)
      setSelectedModel('')
      setSelectedAppliance(null)
    }
  }, [selectedBrand])

  // Buscar electrodoméstico cuando se selecciona un modelo
  useEffect(() => {
    if (selectedType && selectedBrand && selectedModel) {
      findAppliance(selectedType, selectedBrand, selectedModel)
    }
  }, [selectedModel])

  const loadTypes = async () => {
    try {
      setIsLoading(true)
      const typesData = await applianceService.getTypes()
      setTypes(typesData)
    } catch (error) {
      console.error('Error loading types:', error)
      setError('Error al cargar los tipos de electrodomésticos')
    } finally {
      setIsLoading(false)
    }
  }

  const loadBrands = async (type: string) => {
    try {
      const brandsData = await applianceService.getBrandsByType(type)
      setBrands(brandsData)
    } catch (error) {
      console.error('Error loading brands:', error)
      setError('Error al cargar las marcas')
    }
  }

  const loadModels = async (type: string, brand: string) => {
    try {
      const modelsData = await applianceService.getModelsByTypeAndBrand(type, brand)
      setModels(modelsData)
    } catch (error) {
      console.error('Error loading models:', error)
      setError('Error al cargar los modelos')
    }
  }

  const findAppliance = async (type: string, brand: string, model: string) => {
    try {
      const appliance = await applianceService.findByTypeAndBrandAndModel(type, brand, model)
      setSelectedAppliance(appliance)
    } catch (error) {
      console.error('Error finding appliance:', error)
      setError('Error al buscar el electrodoméstico')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAppliance) {
      setError('Debes seleccionar un electrodoméstico')
      return
    }

    if (!description.trim()) {
      setError('Debes describir el problema')
      return
    }

    if (!clientPrice || parseFloat(clientPrice) <= 0) {
      setError('Debes ingresar un precio válido')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      await serviceRequestService.createRequest({
        applianceId: selectedAppliance.id,
        description: description.trim(),
        clientPrice: parseFloat(clientPrice),
        // validMinutes se omite para usar el valor por defecto de 5 minutos
      })

      setSuccess(true)
      
      // Llamar callback de éxito después de un momento
      setTimeout(() => {
        onSuccess?.()
      }, 2000)    } catch (error) {
      console.error('Error creating request:', error)
      const errorMessage = 'Error al crear la solicitud. Inténtalo de nuevo.'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedType('')
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedAppliance(null)
    setDescription('')
    setClientPrice('')
    setError(null)
    setSuccess(false)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-12"
      >
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Solicitud Creada!
        </h3>
        <p className="text-gray-600 mb-6">
          Tu solicitud de servicio ha sido publicada. Los técnicos pueden hacer ofertas durante los próximos 5 minutos.
        </p>
        <button
          onClick={resetForm}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear Otra Solicitud
        </button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nueva Solicitud de Servicio</h2>
          <p className="text-gray-600">
            Describe tu problema y selecciona el electrodoméstico específico
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
          >
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Selección de Electrodoméstico */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Selecciona tu electrodoméstico</h3>
          
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de electrodoméstico
            </label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">Selecciona un tipo...</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Marca */}
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona una marca...</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </motion.div>
          )}

          {/* Modelo */}
          {selectedBrand && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un modelo...</option>
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </motion.div>
          )}

          {/* Electrodoméstico seleccionado */}
          {selectedAppliance && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">
                    Electrodoméstico seleccionado:
                  </p>
                  <p className="text-green-700">{selectedAppliance.name}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Descripción del problema */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe el problema
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe detalladamente qué problema tiene tu electrodoméstico..."
          />
        </div>

        {/* Precio ofrecido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio que estás dispuesto a pagar
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={clientPrice}
              onChange={(e) => setClientPrice(e.target.value)}
              min="1000"
              step="1000"
              className="w-full pl-10 pr-16 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">COP</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Mínimo $1,000 COP
          </p>
        </div>

        {/* Información sobre el tiempo */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tiempo de vigencia:</strong> Tu solicitud estará disponible para ofertas durante 5 minutos después de ser publicada.
          </p>
        </div>

        {/* Botones */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={!selectedAppliance || !description.trim() || !clientPrice || isSubmitting}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creando solicitud...' : 'Crear Solicitud'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ServiceRequestForm
