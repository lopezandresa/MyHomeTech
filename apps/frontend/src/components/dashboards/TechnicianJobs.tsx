import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  WifiIcon
} from '@heroicons/react/24/outline'
import { getStatusColor, getStatusText } from '../../utils/statusUtils'
import { formatDate } from '../../utils/dateUtils'
import { ConnectionState } from '../../hooks/useRealTimeServiceRequests'
import DashboardSection from '../common/DashboardSection'
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
      </motion.div>
    )
  }
  return (
    <DashboardSection
      title="Mis Trabajos Asignados"
      subtitle={`${myRequests.length} trabajos`}
      icon={BriefcaseIcon}
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.appliance?.name || 'Electrodoméstico no disponible'}
                    </h3>
                    <p className="text-gray-600">
                      Cliente: {request.client?.firstName || 'N/A'} {request.client?.firstLastName || ''}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Descripción:</h4>
                <p className="text-gray-600">{request.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    ) : (
                      'Fecha por programar'
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Estado del servicio:</span>
                  <p className="font-medium text-gray-700">
                    Confirmado y agendado
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardSection>
  )
}