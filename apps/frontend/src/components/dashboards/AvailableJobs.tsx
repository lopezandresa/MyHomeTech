import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  WrenchScrewdriverIcon,
  XMarkIcon,
  ArrowPathIcon,
  WifiIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { getStatusColor, getStatusText } from '../../utils/statusUtils'
import { getServiceTypeText, getServiceTypeColor, getServiceTypeIcon } from '../../utils/serviceTypeUtils'
import { formatDate, formatDateTime } from '../../utils/dateUtils'
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
  success,
  setSuccess,
  pendingRequests,
  showRecentJobAlert,
  setShowRecentJobAlert,
  technicianNotifications,
  handleAcceptDirectly,
  setSelectedRequest,
  handleReconnect
}) => {  const [conflictDetails, setConflictDetails] = useState<{[key: number]: string}>({})

  // Función simplificada - ahora los toasts se manejan en useDashboardActions
  
  // Función para verificar si hay una propuesta de fecha alternativa pendiente
  const hasPendingAlternativeDateProposal = (request: ServiceRequest): boolean => {
    return request.alternativeDateProposals?.some(
      proposal => proposal.status === 'pending'
    ) || false
  }
  const handleAcceptWithErrorHandling = async (requestId: number) => {
    try {
      setConflictDetails(prev => ({ ...prev, [requestId]: '' }))
      await handleAcceptDirectly(requestId)
    } catch (error: any) {
      // Los errores y toasts ya se manejan en useDashboardActions
      console.error('Error accepting request:', error)
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
  }  return (    <DashboardPanel
      title="Trabajos Disponibles"      subtitle={`${pendingRequests.length} solicitudes`}
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
      ) : (        <div className="grid gap-6">          {pendingRequests.map((request, index) => {
            return (
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
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.appliance?.name || 'Electrodoméstico no disponible'}
                      </h3>
                      {/* Indicador de tipo de servicio */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(request.serviceType)}`}>
                        {getServiceTypeIcon(request.serviceType)} {getServiceTypeText(request.serviceType)}
                      </span>
                    </div>
                    {/* Información del cliente con foto de perfil */}
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="relative">
                        {request.client?.profilePhotoUrl ? (
                          <img
                            src={request.client.profilePhotoUrl}
                            alt={`${request.client.firstName} ${request.client.firstLastName}`}
                            className="h-8 w-8 rounded-full object-cover border-2 border-blue-200"
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">
                          Cliente: {request.client?.firstName || 'N/A'} {request.client?.firstLastName || ''}
                        </p>
                        <p className="text-sm text-gray-500">
                          Publicada el {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
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
                </div>
              )}

              {/* Fecha y hora propuesta por el cliente */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">Fecha y hora solicitada:</h4>
                </div>                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-lg font-semibold text-blue-800">
                    {formatDateTime(request.proposedDateTime)}
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
                  </div>                </motion.div>
              )}              {/* Mis propuestas para esta solicitud */}
              {request.alternativeDateProposals && request.alternativeDateProposals.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">
                      Mis propuestas enviadas ({request.alternativeDateProposals?.length || 0}/3)
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {request.alternativeDateProposals && request.alternativeDateProposals.length > 0 ? (
                      request.alternativeDateProposals
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((proposal) => (
                        <div key={proposal.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">
                                Propuesta #{proposal.proposalCount}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(proposal.proposedDateTime).toLocaleDateString('es-ES', {
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric'
                                })} a las {new Date(proposal.proposedDateTime).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              proposal.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : proposal.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {proposal.status === 'pending' ? 'Pendiente' : 
                               proposal.status === 'accepted' ? '✅ Aceptada' : '❌ Rechazada'}
                            </span>
                          </div>
                          {proposal.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              💬 {proposal.comment}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Enviada el {new Date(proposal.createdAt).toLocaleDateString('es-ES')}
                            {proposal.resolvedAt && (
                              <span> • {proposal.status === 'accepted' ? 'Aceptada' : 'Rechazada'} el {new Date(proposal.resolvedAt).toLocaleDateString('es-ES')}</span>
                            )}                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                        No has enviado propuestas para esta solicitud aún
                      </div>
                    )}
                  </div>
                  {(request.alternativeDateProposals?.length || 0) >= 3 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                      ⚠️ Has alcanzado el límite de 3 propuestas para esta solicitud
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleAcceptWithErrorHandling(request.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <CalendarDaysIcon className="h-4 w-4" />
                  Aceptar fecha propuesta
                </button>                <button
                  onClick={() => setSelectedRequest(request)}
                  disabled={hasPendingAlternativeDateProposal(request)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                    hasPendingAlternativeDateProposal(request)
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                  title={hasPendingAlternativeDateProposal(request) ? 'Ya tienes una propuesta de fecha alternativa pendiente' : ''}
                >                  <ClockIcon className="h-4 w-4" />
                  Proponer fecha alternativa                </button>
              </div>
              
              {/* Mensaje informativo si hay propuesta pendiente */}
              {hasPendingAlternativeDateProposal(request) && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Ya tienes una propuesta de fecha alternativa pendiente para esta solicitud. 
                      Espera la respuesta del cliente antes de enviar otra propuesta.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
            )
          })}
        </div>
      )}    </DashboardPanel>
  )
}