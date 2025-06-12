import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { serviceRequestService } from '../../services/serviceRequestService'
import type { ServiceRequest } from '../../types/index'

const ClientDashboard: React.FC = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadRequests()
    }
  }, [user])

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      const data = await serviceRequestService.getClientRequests(user!.id)
      setRequests(data)
    } catch (error) {
      console.error('Error loading requests:', error)
      setError('Error al cargar las solicitudes')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'offered':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'offered':
        return 'Con Oferta'
      case 'accepted':
        return 'Aceptada'
      case 'scheduled':
        return 'Programada'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />
      case 'offered':
        return <CurrencyDollarIcon className="h-5 w-5" />
      case 'accepted':
      case 'scheduled':
        return <CalendarIcon className="h-5 w-5" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5" />
    }
  }

  const handleAcceptOffer = async (requestId: number, acceptClientPrice: boolean) => {
    try {
      await serviceRequestService.acceptRequest(requestId, { acceptClientPrice })
      await loadRequests() // Reload requests
    } catch (error) {
      console.error('Error accepting offer:', error)
      setError('Error al aceptar la oferta')
    }
  }

  const handleCompleteService = async (requestId: number) => {
    try {
      await serviceRequestService.completeRequest(requestId)
      await loadRequests() // Reload requests
    } catch (error) {
      console.error('Error completing service:', error)
      setError('Error al marcar como completado')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Solicitudes de Servicio</h1>
          <p className="text-gray-600 mt-2">Gestiona tus solicitudes de técnicos especializados</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes solicitudes</h3>
            <p className="text-gray-600 mb-6">Crea tu primera solicitud de servicio técnico</p>
            <button
              onClick={() => window.location.hash = '#hero'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Solicitar Técnico
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.appliance.name}
                      </h3>
                      <p className="text-gray-600">
                        Creada el {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Descripción del problema:</h4>
                  <p className="text-gray-600">{request.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tu oferta:</span>
                    <p className="text-lg font-semibold text-green-600">
                      ${request.clientPrice.toLocaleString()} COP
                    </p>
                  </div>
                  {request.technicianPrice && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contraoferta del técnico:</span>
                      <p className="text-lg font-semibold text-blue-600">
                        ${request.technicianPrice.toLocaleString()} COP
                      </p>
                    </div>
                  )}
                </div>

                {request.technician && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Técnico asignado:</span>
                    <p className="font-medium">{request.technician.name}</p>
                  </div>
                )}

                {request.scheduledAt && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-600">Fecha programada:</span>
                    <p className="font-medium">
                      {new Date(request.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Action buttons based on status */}
                <div className="flex flex-wrap gap-3">
                  {request.status === 'offered' && request.technicianPrice && (
                    <>
                      <button
                        onClick={() => handleAcceptOffer(request.id, true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Aceptar mi precio (${request.clientPrice.toLocaleString()})
                      </button>
                      <button
                        onClick={() => handleAcceptOffer(request.id, false)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Aceptar contraoferta (${request.technicianPrice.toLocaleString()})
                      </button>
                    </>
                  )}
                  
                  {request.status === 'scheduled' && (
                    <button
                      onClick={() => handleCompleteService(request.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Marcar como Completado
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientDashboard