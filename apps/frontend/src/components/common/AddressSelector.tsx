import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MapPinIcon,
  ChevronDownIcon,
  CheckIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import addressService from '../../services/addressService'
import type { Address } from '../../types/index'

interface AddressSelectorProps {
  selectedAddressId?: number
  onAddressSelect: (addressId: number) => void
  error?: string
  className?: string
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onAddressSelect,
  error,
  className = ''
}) => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      const addressList = await addressService.getMyAddresses()
      setAddresses(addressList)
      
      // Si no hay dirección seleccionada pero hay direcciones, seleccionar la principal
      if (!selectedAddressId && addressList.length > 0) {
        const primaryAddress = addressList.find(addr => addr.isDefault) || addressList[0]
        onAddressSelect(primaryAddress.id)
      }
    } catch (error: any) {
      console.error('Error loading addresses:', error)
      setLoadError('Error al cargar las direcciones')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)

  const handleAddressSelect = (addressId: number) => {
    onAddressSelect(addressId)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
        <MapPinIcon className="h-4 w-4" />
        <span>Dirección del Servicio</span>
        <span className="text-red-500">*</span>
      </label>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-gray-500">Cargando direcciones...</span>
          </div>
        </div>
      )}

      {/* Load Error */}
      {loadError && (
        <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{loadError}</span>
          </div>
        </div>
      )}

      {/* No Addresses */}
      {!isLoading && !loadError && addresses.length === 0 && (
        <div className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
              <span className="text-orange-700">No tienes direcciones configuradas</span>
            </div>
            <button
              type="button"
              onClick={() => window.location.href = '/dashboard/profile'}
              className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 transition-colors"
            >
              <PlusIcon className="h-3 w-3" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      )}

      {/* Address Selector */}
      {!isLoading && !loadError && addresses.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex-1">
              {selectedAddress ? (
                <div className="flex items-center space-x-2">
                  {selectedAddress.isDefault && (
                    <StarSolidIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {selectedAddress.street} {selectedAddress.number}
                      {selectedAddress.apartment && ` Apt. ${selectedAddress.apartment}`}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {selectedAddress.neighborhood}, {selectedAddress.city}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">Selecciona una dirección</span>
              )}
            </div>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => handleAddressSelect(address.id)}
                  className={`w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedAddressId === address.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {address.isDefault && (
                        <StarSolidIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {address.street} {address.number}
                            {address.apartment && ` Apt. ${address.apartment}`}
                          </p>
                          {address.isDefault && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.neighborhood}, {address.city}
                        </p>
                        <p className="text-sm text-gray-500">
                          {address.state}, {address.country} - {address.postalCode}
                        </p>
                        {address.additionalInfo && (
                          <p className="text-xs text-gray-400 mt-1">
                            {address.additionalInfo}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedAddressId === address.id && (
                      <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
              
              {/* Add Address Option */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  window.location.href = '/dashboard/profile'
                }}
                className="w-full px-3 py-3 text-left border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 text-blue-600">
                  <PlusIcon className="h-4 w-4" />
                  <span className="font-medium">Agregar nueva dirección</span>
                </div>
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default AddressSelector