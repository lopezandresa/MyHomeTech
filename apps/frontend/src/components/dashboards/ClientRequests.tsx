import React from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { getStatusColor, getStatusText, getStatusIcon } from '../../utils/statusUtils'
import { formatDate } from '../../utils/dateUtils'
import type { ServiceRequest } from '../../types/index'

interface ClientRequestsProps {
  isLoading: boolean
  error: string | null
  setError: (error: string | null) => void
  clientRequests: ServiceRequest[]
  requestFilter: 'in-progress' | 'all'
  setRequestFilter: (filter: 'in-progress' | 'all') => void
  setShowNewRequestModal: (show: boolean) => void
  handleCompleteService: (requestId: number) => Promise<void>
  handleCancelRequest: (requestId: number) => Promise<void>
}

export const ClientRequests: React.FC<ClientRequestsProps> = ({
  isLoading,
  error,
  setError,
  clientRequests,
  requestFilter,
  setRequestFilter,
  setShowNewRequestModal,
  handleCompleteService,
  handleCancelRequest
}) => {
  // Usar directamente los datos pasados como props, sin fetches adicionales
  
  if (isLoading) {
    return (      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus solicitudes...</p>
        </div>
      </div>
    )
  }

  const filteredRequests = clientRequests.filter(request => {
    if (requestFilter === 'in-progress') {
      return ['pending', 'accepted', 'scheduled', 'in_progress'].includes(request.status)
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mis Solicitudes</h2>
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center space-x-4 mb-6">
        <FunnelIcon className="h-5 w-5 text-gray-500" />
        <div className="flex space-x-2">
          <button
            onClick={() => setRequestFilter('in-progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              requestFilter === 'in-progress'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            En Curso ({clientRequests.filter(r => ['pending', 'accepted', 'scheduled', 'in_progress'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setRequestFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              requestFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas ({clientRequests.length})
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Cerrar
          </button>
        </motion.div>
      )}

      {filteredRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes solicitudes</h3>
          <p className="text-gray-600">Crea una solicitud de servicio para comenzar</p>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nueva Solicitud
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {request.appliance?.name || 'Electrodoméstico no disponible'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Creada: {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
                  <div className="mt-4 text-gray-700">
                  <p>{request.description}</p>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Fecha Propuesta:</p>
                    <p className="text-gray-900">{formatDate(request.proposedDateTime)}</p>
                  </div>
                  {request.technician && (
                    <div>
                      <p className="font-medium text-gray-500">Técnico:</p>
                      <p className="text-gray-900">{request.technician.firstName} {request.technician.firstLastName}</p>
                    </div>
                  )}
                </div><div className="mt-4">
                  {request.status === 'pending' && (
                    <div className="flex items-center justify-between p-3 rounded-lg">
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm flex items-center gap-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancelar solicitud
                      </button>
                    </div>
                  )}

                  {request.status === 'scheduled' && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-800 mb-2">Servicio programado:</p>
                      <p className="text-sm text-gray-600">Fecha: <span className="font-medium">{new Date(request.scheduledAt!).toLocaleString()}</span></p>
                      {request.technician && (
                        <p className="text-sm text-gray-600 mt-1">
                          Técnico: <span className="font-medium">{request.technician.firstName} {request.technician.firstLastName}</span>
                        </p>
                      )}
                      <button
                        onClick={() => handleCompleteService(request.id)}
                        className="mt-3 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Marcar como completada
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}