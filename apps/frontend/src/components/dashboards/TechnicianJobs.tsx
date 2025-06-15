import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  WifiIcon,
  UserCircleIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline'
import { getStatusColor, getStatusText } from '../../utils/statusUtils'
import { getServiceTypeText, getServiceTypeColor, getServiceTypeIcon } from '../../utils/serviceTypeUtils'
import { formatDate } from '../../utils/dateUtils'
import { ConnectionState } from '../../hooks/useRealTimeServiceRequests'
import DashboardPanel from '../common/DashboardPanel'
import CreateHelpTicketModal from '../help/CreateHelpTicketModal'
import type { ServiceRequest } from '../../types/index'

interface TechnicianJobsProps {
  myRequests: ServiceRequest[]
  technicianNotifications: any
  setSelectedRequest: (request: ServiceRequest) => void
  handleReconnect: () => void
}

export const TechnicianJobs: React.FC<TechnicianJobsProps> = ({
  myRequests,
  technicianNotifications,
  handleReconnect
}) => {
  // Estados para el modal de ayuda
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [selectedServiceForHelp, setSelectedServiceForHelp] = useState<ServiceRequest | null>(null)

  // Función para abrir el modal de ayuda
  const handleHelpClick = (request: ServiceRequest) => {
    setSelectedServiceForHelp(request)
    setShowHelpModal(true)
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
      </motion.div>    )
  }

  return (
    <DashboardPanel
      title="Mis Trabajos Asignados"
      subtitle={`${myRequests.length} trabajos`}
    >
      <AnimatePresence>
        {renderConnectionAlert()}
      </AnimatePresence>

      {myRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes trabajos asignados</h3>
          <p className="text-gray-600">Los trabajos que aceptes aparecerán aquí</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {myRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
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
                            className="h-8 w-8 rounded-full object-cover border-2 border-green-200"
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">
                          Cliente: {request.client?.firstName || 'N/A'} {request.client?.firstLastName || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Descripción:</h4>
                <p className="text-gray-600">{request.description}</p>
              </div>              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Fecha programada:</span>
                  <p className="font-medium">
                    {request.scheduledAt ? (
                      <>
                        {formatDate(request.scheduledAt)} a las {new Date(request.scheduledAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </>
                    ) : (                      'Fecha por programar'                    )}
                  </p>
                </div>
                
              </div>

              {/* Información adicional para servicios cancelados */}
              {request.status === 'cancelled' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-red-800 mb-2">Servicio cancelado</p>
                <p className="text-sm text-gray-600">
                  Fecha de cancelación: <span className="font-medium">
                    {formatDate(request.cancelledAt!)}
                  </span>
                </p>
                
                {/* Información del ticket de cancelación */}
                {request.cancellationReason && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Información de cancelación:
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Motivo:</span> {request.cancellationReason}
                    </p>
                    {/* {request.cancelledByUser && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Cancelado por:</span> {' '}
                        {request.cancelledByUser.firstName} {request.cancelledByUser.firstLastName} ({request.cancelledByUser.role})
                        {request.cancelledByUser.role === 'admin' && (
                          <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Administrador
                          </span>
                        )}
                      </p>
                    )} */}
                    {request.cancellationTicketCreatedAt && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ticket creado:</span> {' '}
                        {formatDate(request.cancellationTicketCreatedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

              {/* Información adicional para servicios completados */}
              {request.status === 'completed' && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 mb-2">Servicio completado</p>
                <p className="text-sm text-gray-600">
                  Completado el: <span className="font-medium">{formatDate(request.completedAt!)}</span>
                </p>
                {request.technician && (
                  <p className="text-sm text-gray-600 mt-1">
                    Técnico: <span className="font-medium">{request.technician.firstName} {request.technician.firstLastName}</span>
                  </p>
                )}
              </div>
            )}

              {/* Botón de ayuda */}
              <div className="mt-4">
                <button
                  onClick={() => handleHelpClick(request)}
                  className="flex items-center px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-medium hover:bg-blue-200 transition-all"
                >
                  <LifebuoyIcon className="h-5 w-5 mr-2" />
                  Necesito ayuda con este trabajo
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal para crear ticket de ayuda */}
      {showHelpModal && selectedServiceForHelp && (
        <CreateHelpTicketModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          serviceRequest={selectedServiceForHelp}
        />
      )}
    </DashboardPanel>
  )
}