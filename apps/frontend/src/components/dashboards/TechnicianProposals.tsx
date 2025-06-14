import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDaysIcon,
  ArrowPathIcon,
  WifiIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { ConnectionState } from '../../hooks/useRealTimeServiceRequests'
import DashboardPanel from '../common/DashboardPanel'
import AlternativeDateProposalCard from '../AlternativeDateProposalCard'
import { serviceRequestService } from '../../services/serviceRequestService'
import type { AlternativeDateProposal } from '../../types/index'

interface TechnicianProposalsProps {
  technicianNotifications: any
  handleReconnect: () => void
}

export const TechnicianProposals: React.FC<TechnicianProposalsProps> = ({
  technicianNotifications,
  handleReconnect
}) => {
  const [proposals, setProposals] = useState<AlternativeDateProposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar propuestas del técnico
  const loadProposals = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const technicianProposals = await serviceRequestService.getTechnicianAlternativeDateProposals()
      setProposals(technicianProposals)
    } catch (err: any) {
      console.error('Error loading technician proposals:', err)
      setError('Error al cargar las propuestas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProposals()
  }, [])

  // Recargar cuando lleguen nuevas notificaciones
  useEffect(() => {
    if (technicianNotifications.notifications.length > 0) {
      loadProposals()
    }
  }, [technicianNotifications.notifications.length])

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
              <h3 className={`font-medium ${
                isConnecting ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {isConnecting ? 'Reconectando...' : 'Conexión perdida'}
              </h3>
              <p className={`text-sm ${
                isConnecting ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {isConnecting 
                  ? 'Reestableciendo conexión para recibir actualizaciones en tiempo real'
                  : 'No puedes recibir actualizaciones de tus propuestas en tiempo real'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleReconnect}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isConnecting 
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
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

  // Agrupar propuestas por estado
  const groupedProposals = {
    pending: proposals.filter(p => p.status === 'pending'),
    accepted: proposals.filter(p => p.status === 'accepted'),
    rejected: proposals.filter(p => p.status === 'rejected')
  }

  if (isLoading) {
    return (
      <DashboardPanel
        title="Mis Propuestas de Fechas"
        subtitle="Cargando..."
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus propuestas...</p>
          </div>
        </div>
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel
      title="Mis Propuestas de Fechas"
      subtitle={`${proposals.length} propuestas enviadas`}
    >
      <AnimatePresence>
        {renderConnectionAlert()}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
            <button 
              onClick={loadProposals}
              className="ml-3 text-sm text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        </motion.div>
      )}

      {proposals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <CalendarDaysIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No has enviado propuestas</h3>
          <p className="text-gray-600">Cuando propongas fechas alternativas a clientes, aparecerán aquí</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Propuestas Pendientes */}
          {groupedProposals.pending.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                Pendientes de respuesta ({groupedProposals.pending.length})
              </h3>
              <div className="space-y-4">
                {groupedProposals.pending.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlternativeDateProposalCard
                      proposal={proposal}
                      isClient={false}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Propuestas Aceptadas */}
          {groupedProposals.accepted.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Aceptadas ({groupedProposals.accepted.length})
              </h3>
              <div className="space-y-4">
                {groupedProposals.accepted.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlternativeDateProposalCard
                      proposal={proposal}
                      isClient={false}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Propuestas Rechazadas */}
          {groupedProposals.rejected.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Rechazadas ({groupedProposals.rejected.length})
              </h3>
              <div className="space-y-4">
                {groupedProposals.rejected.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlternativeDateProposalCard
                      proposal={proposal}
                      isClient={false}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardPanel>
  )
}

export default TechnicianProposals
