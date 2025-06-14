import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  WrenchScrewdriverIcon,
  XMarkIcon,
  ArrowPathIcon,
  WifiIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { getStatusColor, getStatusText } from '../../utils/statusUtils'
import { formatDate } from '../../utils/dateUtils'
import { ConnectionState } from '../../hooks/useRealTimeServiceRequests'
import DashboardPanel from '../common/DashboardPanel'
import type { ServiceRequest } from '../../types/index'

interface AvailableJobsProps {
  isLoading: boolean
  error: string | null
  setError: (error: string | null) => void
  success: string | null
  setSuccess: (success: string | null) => void
  pendingRequests: ServiceRequest[]
  setPendingRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>
  showRecentJobAlert: boolean
  setShowRecentJobAlert: (show: boolean) => void
  technicianNotifications: any
  handleAcceptDirectly: (requestId: number) => Promise<void>
  handleProposeAlternativeDate: (requestId: number, alternativeDate: string) => Promise<void>
  setSelectedRequest: (request: ServiceRequest) => void
  handleReconnect: () => void
}

export const AvailableJobs: React.FC<AvailableJobsProps> = ({
  isLoading,
  error,
  setError,
  success,
  setSuccess,
  pendingRequests,
  showRecentJobAlert,
  setShowRecentJobAlert,
  technicianNotifications,
  handleAcceptDirectly,
  setSelectedRequest,
  handleReconnect
}) => {
  const [conflictDetails, setConflictDetails] = useState<{[key: number]: string}>({})

  // Función mejorada para manejar la aceptación con mejor manejo de errores
  const handleAcceptWithErrorHandling = async (requestId: number) => {
    try {
      setError(null)
      setConflictDetails(prev => ({ ...prev, [requestId]: '' }))
      await handleAcceptDirectly(requestId)
    } catch (error: any) {
      console.error('Error accepting request:', error)
      
      // Extraer el mensaje de error del backend
      let errorMessage = 'Error al aceptar la solicitud'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
        
        // Si el error contiene información de conflicto, guardarlo específicamente para esta solicitud
        if (errorMessage.includes('Servicio conflictivo:')) {
          setConflictDetails(prev => ({ ...prev, [requestId]: errorMessage }))
          return // No mostrar en el error general
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    }
  }

  // Alerta de conexión para técnicos
  const renderConnectionAlert = () => {
    if (technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED) {
      return null
    }

    const isConnecting = technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`mb-4 p-4 rounded-lg border ${
          isConnecting ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isConnecting ? (
              <ArrowPathIcon className="h-5 w-5 text-yellow-600 mr-2 animate-spin" />
            ) : (
              <WifiIcon className="h-5 w-5 text-red-600 mr-2" />
            )}
            <div>
              <h3 className={`font-medium ${isConnecting ? 'text-yellow-800' : 'text-red-800'}`}>
                {isConnecting ? 'Conectando...' : 'Desconectado'}
              </h3>
              <p className="text-sm mt-1 text-gray-600">
                {isConnecting 
                  ? 'Reconectando al servidor. Por favor espere...' 
                  : 'No se pudo conectar al servidor. Los datos pueden estar desactualizados.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleReconnect}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              isConnecting 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Reconectar ahora
          </button>
        </div>
        {isConnecting && technicianNotifications.connectionStatus.nextAttemptIn && (
          <div className="mt-2 text-xs text-gray-500">
            Intento {technicianNotifications.connectionStatus.attempts} de {technicianNotifications.connectionStatus.maxAttempts} • 
            Próximo intento en {Math.round(technicianNotifications.connectionStatus.nextAttemptIn / 1000)} segundos
          </div>
        )}
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando trabajos disponibles...</p>
        </div>
      </div>
    )
  }  return (
    <DashboardPanel
      title="Trabajos Disponibles"
      subtitle={`${pendingRequests.length} solicitudes`}
    >
      <AnimatePresence>
        {renderConnectionAlert()}
      </AnimatePresence>

      <AnimatePresence>
        {showRecentJobAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h3 className="font-medium text-green-800">¡Nueva solicitud disponible!</h3>
                <p className="text-sm text-green-600">Revisa las solicitudes pendientes para ver los nuevos trabajos.</p>
              </div>
            </div>
            <button
              onClick={() => setShowRecentJobAlert(false)}
              className="text-green-600 hover:text-green-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Cerrar
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-green-800 font-medium">¡Éxito!</p>
              <p className="text-green-700 mt-1">{success}</p>
            </div>
          </div>
          <button 
            onClick={() => setSuccess(null)}
            className="mt-2 text-sm text-green-600 hover:text-green-800 underline"
          >
            Cerrar
          </button>
        </motion.div>
      )}

      {pendingRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes disponibles</h3>
          <p className="text-gray-600">Las nuevas solicitudes aparecerán aquí</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {pendingRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 relative overflow-hidden"
            >
              {/* Indicador de nueva solicitud */}
              {request.createdAt && (Date.now() - new Date(request.createdAt).getTime() < 5 * 60 * 1000) && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg animate-pulse">
                  NUEVA
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.appliance?.name || 'Electrodoméstico no disponible'}
                    </h3>
                    <p className="text-gray-600">
                      Cliente: {request.client?.firstName || 'N/A'} {request.client?.firstLastName || ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      Publicada el {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Problema reportado:</h4>
                <p className="text-gray-600">{request.description}</p>
              </div>

              {/* Información de dirección */}
              {request.address && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Dirección del servicio:</h4>
                  <p className="text-gray-700">
                    {request.address.street} {request.address.number}
                    {request.address.apartment && `, Apt. ${request.address.apartment}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {request.address.city}, {request.address.state} - {request.address.postalCode}
                  </p>
                  {request.address.isDefault && (
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Dirección principal
                    </span>
                  )}
                </div>
              )}

              {/* Fecha y hora propuesta por el cliente */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">Fecha y hora solicitada:</h4>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-lg font-semibold text-blue-800">
                    {formatDate(request.proposedDateTime)} a las {new Date(request.proposedDateTime).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Mostrar detalles del conflicto si existe */}
              {conflictDetails[request.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-800 mb-1">Conflicto de horario detectado</h4>
                      <p className="text-sm text-orange-700">{conflictDetails[request.id]}</p>
                      <p className="text-xs text-orange-600 mt-2">
                        💡 Tip: Puedes proponer una fecha alternativa para este servicio
                      </p>
                    </div>
                    <button
                      onClick={() => setConflictDetails(prev => ({ ...prev, [request.id]: '' }))}
                      className="text-orange-400 hover:text-orange-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleAcceptWithErrorHandling(request.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <CalendarDaysIcon className="h-4 w-4" />
                  Aceptar fecha propuesta
                </button>
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center gap-2"
                >
                  <ClockIcon className="h-4 w-4" />
                  Proponer fecha alternativa
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}    </DashboardPanel>
  )
}