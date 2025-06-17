import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { applianceService } from '../services/applianceService'
import { serviceRequestService } from '../services/serviceRequestService'
import { serviceRequestTypeService, type ServiceRequestType } from '../services/serviceRequestTypeService'
import { toInputDateFormat } from '../utils/dateUtils'
import AddressSelector from './common/AddressSelector'
import { useToast } from './common/ToastProvider'
import type { Appliance } from '../types/index'

interface ServiceRequestFormProps {
  onSuccess?: (newRequest?: any) => void
  onCancel?: () => void
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({ onSuccess, onCancel }) => {
  // Hook para toasts
  const { showSuccess, showError } = useToast()

  // Estados adicionales para tipos de solicitud
  const [serviceRequestTypes, setServiceRequestTypes] = useState<ServiceRequestType[]>([])
  const [selectedServiceType, setSelectedServiceType] = useState<string>('')
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(false)

  // Datos de la cascada
  const [types, setTypes] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  
  // Selecciones del usuario
  const [selectedType, setSelectedType] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>()
  
  // Datos del formulario
  const [description, setDescription] = useState('')
  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('')
    // Estados de la UI
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidatingAvailability, setIsValidatingAvailability] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar tipos de solicitud al montar el componente
  useEffect(() => {
    loadServiceRequestTypes()
  }, [])

  // Función para cargar tipos de solicitud desde el backend
  const loadServiceRequestTypes = async () => {
    try {
      setLoadingServiceTypes(true)
      const types = await serviceRequestTypeService.getAll()
      setServiceRequestTypes(types)
      
      // Seleccionar el primer tipo por defecto (generalmente "Reparación")
      if (types.length > 0) {
        setSelectedServiceType(types[0].name)
      }
    } catch (error) {
      console.error('Error loading service request types:', error)
      showError('Error', 'No se pudieron cargar los tipos de solicitud')
    } finally {
      setLoadingServiceTypes(false)
    }
  }

  // Cargar tipos al montar el componente
  useEffect(() => {
    loadTypes()
    // Establecer fecha mínima como mañana
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setProposedDate(toInputDateFormat(tomorrow))
    setProposedTime('08:00') // Hora por defecto: 8 AM
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
      setSelectedAppliance(appliance)    } catch (error) {
      console.error('Error finding appliance:', error)
      setError('Error al buscar el electrodoméstico')
    }
  }

  const validateDateTime = async () => {
    if (!proposedDate || !proposedTime) {
      setError('Debes seleccionar fecha y hora para el servicio')
      return false
    }

    const proposedDateTime = new Date(`${proposedDate}T${proposedTime}`)
    
    // Validar que sea fecha futura
    const validation = serviceRequestService.validateFutureDate(proposedDateTime)
    if (!validation.valid) {
      setError(validation.message!)
      return false
    }

    // Validar horario de trabajo (6 AM - 6 PM)
    const workingHoursValidation = serviceRequestService.validateWorkingHours(proposedDateTime)
    if (!workingHoursValidation.valid) {
      setError(workingHoursValidation.message!)
      return false
    }

    // 🔒 VALIDAR DISPONIBILIDAD DEL CLIENTE
    try {      setIsValidatingAvailability(true)
      
      const availability = await serviceRequestService.validateClientAvailability(proposedDateTime)
      if (!availability.isAvailable) {
        showError('Conflicto de Horario', availability.message!)
        return false
      }
    } catch (error) {
      console.error('Error validating client availability:', error)
      showError('Error de Validación', 'Error al validar la disponibilidad. Inténtalo de nuevo.')
      return false
    } finally {
      setIsValidatingAvailability(false)
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedServiceType) {
      setError('Debes seleccionar un tipo de servicio')
      return
    }

    if (!selectedAppliance) {
      setError('Debes seleccionar un electrodoméstico')
      return
    }

    if (!selectedAddressId) {
      setError('Debes seleccionar una dirección para el servicio')
      return
    }    if (!description.trim()) {
      setError('Debes describir el problema')
      return
    }

    if (!(await validateDateTime())) {
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const proposedDateTime = new Date(`${proposedDate}T${proposedTime}`)
      
      await serviceRequestService.createRequest({
        applianceId: selectedAppliance.id,
        addressId: selectedAddressId,
        description: description.trim(),
        serviceType: selectedServiceType as any, // Incluir el tipo de servicio seleccionado
        proposedDateTime: proposedDateTime.toISOString(),
        validHours: 24, // 24 horas de validez por defecto
        clientPrice: 0 // Precio base por defecto
      })

      // Mostrar toast de éxito
      showSuccess(
        '¡Solicitud Creada!',
        'Tu solicitud ha sido enviada exitosamente. Los técnicos disponibles podrán aceptarla.'
      )
      
      // Llamar callback de éxito inmediatamente
      onSuccess?.()
    } catch (error) {
      console.error('Error creating request:', error)
      const errorMessage = 'Error al crear la solicitud. Inténtalo de nuevo.'
      setError(errorMessage)
      showError(
        'Error al Crear Solicitud',
        errorMessage
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  // Generar opciones de hora (6 AM - 6 PM)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 6; hour < 18; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      const ampm = hour >= 12 ? 'PM' : 'AM'
      options.push({
        value: timeString,
        label: `${displayHour}:00 ${ampm}`
      })    }
    return options
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nueva Solicitud de Servicio</h2>
          <p className="text-gray-600">
            Describe tu problema, selecciona el electrodoméstico y propón una fecha para el servicio
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

        {/* Tipo de Servicio - PRIMER CAMPO */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Tipo de servicio</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Qué tipo de servicio necesitas?
            </label>
            {loadingServiceTypes ? (
              <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <p className="text-gray-500">Cargando tipos de servicio...</p>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecciona el tipo de servicio...</option>
                  {serviceRequestTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.icon} {type.displayName}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            )}
            
            {/* Descripción del tipo seleccionado */}
            {selectedServiceType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-sm text-blue-800">
                  {serviceRequestTypes.find(type => type.name === selectedServiceType)?.description}
                </p>
              </motion.div>
            )}
          </div>
        </div>

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

        {/* Selección de Dirección */}
        <AddressSelector
          selectedAddressId={selectedAddressId}
          onAddressSelect={setSelectedAddressId}
          error={error?.includes('dirección') ? error : undefined}
        />

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

        {/* Fecha y hora propuesta */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Fecha y hora propuesta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del servicio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  min={toInputDateFormat(new Date(Date.now() + 24 * 60 * 60 * 1000))} // Mañana como mínimo
                  className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora del servicio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full pl-10 appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {generateTimeOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Horario de servicio:</strong> 6:00 AM - 6:00 PM. Los técnicos disponibles para la fecha seleccionada podrán aceptar tu solicitud.
            </p>
          </div>
        </div>

        {/* Información sobre el tiempo */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Tiempo de vigencia:</strong> Tu solicitud estará disponible durante 24 horas. Los técnicos que tengan disponibilidad para la fecha propuesta podrán aceptarla.
          </p>
        </div>

        {/* Botones */}
        <div className="flex space-x-4">          <button
            type="submit"
            disabled={!selectedAppliance || !selectedAddressId || !description.trim() || !proposedDate || !proposedTime || isSubmitting || isValidatingAvailability}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isValidatingAvailability ? 'Validando disponibilidad...' : isSubmitting ? 'Creando solicitud...' : 'Crear Solicitud'}
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
