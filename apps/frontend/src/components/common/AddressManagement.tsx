import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  HomeIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import addressService from '../../services/addressService'
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '../../types/index'

interface AddressManagementProps {
  isEditing: boolean
  onAddressesChange?: (addresses: Address[]) => void
}

const AddressManagement: React.FC<AddressManagementProps> = ({ isEditing, onAddressesChange }) => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<CreateAddressRequest>({
    street: '',
    number: '',
    apartment: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Colombia',
    additionalInfo: '',
    isDefault: false
  })

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setIsLoading(true)
      const addressList = await addressService.getMyAddresses()
      setAddresses(addressList)
      if (onAddressesChange) {
        onAddressesChange(addressList)
      }
    } catch (error: any) {
      console.error('Error loading addresses:', error)
      setError('Error al cargar las direcciones')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)
      
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, formData)
        setSuccess('Dirección actualizada correctamente')
      } else {
        await addressService.createAddress(formData)
        setSuccess('Dirección creada correctamente')
      }
      
      await loadAddresses()
      handleCancelForm()
    } catch (error: any) {
      console.error('Error saving address:', error)
      setError(error.response?.data?.message || 'Error al guardar la dirección')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      street: address.street,
      number: address.number,
      apartment: address.apartment || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      additionalInfo: address.additionalInfo || '',
      isDefault: address.isDefault
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) return
    
    try {
      setIsLoading(true)
      await addressService.deleteAddress(id)
      setSuccess('Dirección eliminada correctamente')
      await loadAddresses()
    } catch (error: any) {
      console.error('Error deleting address:', error)
      setError(error.response?.data?.message || 'Error al eliminar la dirección')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPrimary = async (id: number) => {
    try {
      setIsLoading(true)
      await addressService.setPrimaryAddress(id)
      setSuccess('Dirección principal actualizada')
      await loadAddresses()
    } catch (error: any) {
      console.error('Error setting primary address:', error)
      setError(error.response?.data?.message || 'Error al establecer dirección principal')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelForm = () => {
    setShowAddForm(false)
    setEditingAddress(null)
    setFormData({
      street: '',
      number: '',
      apartment: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Colombia',
      additionalInfo: '',
      isDefault: false
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <HomeIcon className="h-5 w-5 mr-2" />
            Direcciones de Domicilio
          </h3>
          <p className="text-sm text-gray-600">
            Gestiona tus direcciones para solicitudes de servicio
          </p>
        </div>
        {isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Agregar Dirección</span>
          </button>
        )}
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-800">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address List */}
      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border rounded-lg ${address.isDefault ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    {address.isDefault && (
                      <StarSolidIcon className="h-4 w-4 text-yellow-500" />
                    )}
                    {address.isDefault && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="text-gray-900">
                    <p className="font-medium">
                      {address.street} {address.number}
                      {address.apartment && ` Apt. ${address.apartment}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.neighborhood}, {address.city}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.state}, {address.country} - {address.postalCode}
                    </p>
                    {address.additionalInfo && (
                      <p className="text-sm text-gray-500 mt-1">
                        {address.additionalInfo}
                      </p>
                    )}
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex items-center space-x-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetPrimary(address.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Establecer como principal"
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tienes direcciones configuradas</p>
          <p className="text-sm text-gray-400">
            {isEditing ? 'Agrega una dirección para continuar' : 'Activa el modo edición para agregar direcciones'}
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAddress ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
                </h3>
                <button
                  onClick={handleCancelForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Street */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calle *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Carrera 7"
                    />
                  </div>

                  {/* Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 45-67"
                    />
                  </div>

                  {/* Apartment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apartamento/Unidad
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 301"
                    />
                  </div>

                  {/* Neighborhood */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barrio *
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Chapinero"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Bogotá"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Cundinamarca"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 110111"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      País *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información Adicional
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Referencias adicionales, instrucciones de entrega, etc."
                  />
                </div>

                {/* Is Default */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Establecer como dirección principal
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    <span>{editingAddress ? 'Actualizar' : 'Crear'} Dirección</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AddressManagement