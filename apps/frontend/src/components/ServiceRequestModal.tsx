import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { serviceRequestService } from '../services/serviceRequestService'
import { addressService } from '../services/addressService'
import type { CreateServiceRequestRequest, Address } from '../types'

interface ServiceRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [formData, setFormData] = useState({
    applianceId: '',
    addressId: '',
    proposedDateTime: '',
    description: '',
    priority: 'medium' as const,
    validHours: 24
  })

  // Load user addresses when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadAddresses()
    }
  }, [isOpen, user])

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true)
      const userAddresses = await addressService.getMyAddresses()
      setAddresses(userAddresses)
      
      // Set default address if available
      const primaryAddress = userAddresses.find(addr => addr.isDefault)
      if (primaryAddress) {
        setFormData(prev => ({ ...prev, addressId: primaryAddress.id.toString() }))
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)
      
      const requestData: CreateServiceRequestRequest = {
        applianceId: parseInt(formData.applianceId),
        addressId: parseInt(formData.addressId),
        proposedDateTime: formData.proposedDateTime,
        description: formData.description,
        clientPrice: 0, // Precio base por defecto
        validHours: formData.validHours
      }

      await serviceRequestService.createRequest(requestData)
      
      // Reset form
      setFormData({
        applianceId: '',
        addressId: '',
        proposedDateTime: '',
        description: '',
        priority: 'medium',
        validHours: 24
      })
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error creating service request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'validHours' ? parseInt(value) : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nueva Solicitud de Servicio</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Selection */}
          <div>
            <label htmlFor="addressId" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            {loadingAddresses ? (
              <div className="text-sm text-gray-500">Cargando direcciones...</div>
            ) : (
              <select
                id="addressId"
                name="addressId"
                value={formData.addressId}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una dirección</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id.toString()}>
                    {address.street} {address.number}, {address.city}
                    {address.isDefault && ' (Principal)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Proposed Date and Time */}
          <div>
            <label htmlFor="proposedDateTime" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y Hora Propuesta
            </label>
            <input
              type="datetime-local"
              id="proposedDateTime"
              name="proposedDateTime"
              value={formData.proposedDateTime}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().slice(0, 16)} // Prevent past dates
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Appliance ID */}
          <div>
            <label htmlFor="applianceId" className="block text-sm font-medium text-gray-700 mb-1">
              ID del Electrodoméstico
            </label>
            <input
              type="number"
              id="applianceId"
              name="applianceId"
              value={formData.applianceId}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Problema
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe el problema con tu electrodoméstico..."
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          {/* Valid Hours */}
          <div>
            <label htmlFor="validHours" className="block text-sm font-medium text-gray-700 mb-1">
              Horas de Validez
            </label>
            <input
              type="number"
              id="validHours"
              name="validHours"
              value={formData.validHours}
              onChange={handleInputChange}
              min="1"
              max="168" // 1 week
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingAddresses}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}