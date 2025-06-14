import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
  PlusIcon,
  XMarkIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { getStatusColor, getStatusText, getStatusIcon } from '../../utils/statusUtils'
import { getServiceTypeText, getServiceTypeColor, getServiceTypeIcon } from '../../utils/serviceTypeUtils'
import { formatDate } from '../../utils/dateUtils'
import DashboardPanel from '../common/DashboardPanel'
import ConfirmModal from '../common/ConfirmModal'
import AlternativeDateProposalCard from '../AlternativeDateProposalCard'
import TechnicianInfo from '../TechnicianInfo'
import { useToast } from '../common/ToastProvider'
import type { ServiceRequest } from '../../types/index'

interface ClientRequestsProps {
  isLoading: boolean
  error: string | null
  clientRequests: ServiceRequest[]
  requestFilter: 'in-progress' | 'scheduled' | 'all'
  setRequestFilter: (filter: 'in-progress' | 'scheduled' | 'all') => void
  setShowNewRequestModal: (show: boolean) => void
  handleCompleteService: (requestId: number) => Promise<void>
  handleCancelRequest: (requestId: number) => Promise<void>
  handleAcceptAlternativeDate?: (proposalId: number) => Promise<void>
  handleRejectAlternativeDate?: (proposalId: number) => Promise<void>
}

export const ClientRequests: React.FC<ClientRequestsProps> = ({
  isLoading,
  error,
  clientRequests,
  requestFilter,
  setRequestFilter,
  setShowNewRequestModal,
  handleCompleteService,
  handleCancelRequest,
  handleAcceptAlternativeDate,
  handleRejectAlternativeDate
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [expandedProposals, setExpandedProposals] = useState<Set<number>>(new Set())
  const { showSuccess, showError } = useToast()
  
  // Función para alternar la expansión de propuestas
  const toggleProposalsExpansion = (requestId: number) => {
    setExpandedProposals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(requestId)) {
        newSet.delete(requestId)
      } else {
        newSet.add(requestId)
      }
      return newSet
    })
  }

  // Función para obtener propuestas pendientes de una solicitud
  const getPendingProposals = (request: ServiceRequest) => {
    const pendingProposals = request.alternativeDateProposals?.filter(proposal => proposal.status === 'pending') || []
    return pendingProposals
  }

  // Función para iniciar el proceso de cancelación
  const handleCancelClick = (requestId: number) => {
    setRequestToCancel(requestId)
    setShowConfirmModal(true)
  }

  // Función para confirmar la cancelación
  const handleConfirmCancel = async () => {
    if (!requestToCancel) return

    try {
      setIsCancelling(true)
      await handleCancelRequest(requestToCancel)
      showSuccess(
        'Solicitud Cancelada',
        'La solicitud ha sido cancelada exitosamente'
      )
    } catch (error) {
      showError(
        'Error al Cancelar',
        'No se pudo cancelar la solicitud. Inténtalo de nuevo.'
      )
    } finally {
      setIsCancelling(false)
      setRequestToCancel(null)
      setShowConfirmModal(false)
    }
  }

  // Función para cerrar el modal
  const handleCloseModal = () => {
    if (!isCancelling) {
      setShowConfirmModal(false)
      setRequestToCancel(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus solicitudes...</p>
        </div>
      </div>
    )
  }

  const filteredRequests = clientRequests.filter(request => {
    if (requestFilter === 'in-progress') {
      return request.status === 'pending'
    } else if (requestFilter === 'scheduled') {
      return request.status === 'scheduled'
    }
    return true
  })

  return (
    <DashboardPanel
      title="Mis Solicitudes"
      subtitle={`${clientRequests.length} solicitudes`}
    >
      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Action buttons and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Nueva Solicitud</span>
        </button>

        {/* Filter buttons */}
        <div className="flex items-center space-x-4">
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
              En Curso ({clientRequests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setRequestFilter('scheduled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                requestFilter === 'scheduled'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Programadas ({clientRequests.filter(r => r.status === 'scheduled').length})
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
      </div>

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
          {filteredRequests.map((request) => {
            const pendingProposals = getPendingProposals(request)
            const isExpanded = expandedProposals.has(request.id)
            
            return (
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
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {request.appliance?.name || 'Electrodoméstico no disponible'}
                          </h3>
                          {/* Indicador de tipo de servicio */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(request.serviceType)}`}>
                            {getServiceTypeIcon(request.serviceType)} {getServiceTypeText(request.serviceType)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Creada: {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
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
                        <p className="font-medium text-gray-500 mb-2">Técnico asignado:</p>
                        <TechnicianInfo 
                          technician={request.technician} 
                          compact={true}
                          showRatingsButton={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Mensaje informativo sobre propuestas pendientes O botón para ver todas las propuestas */}
                  {request.alternativeDateProposals && request.alternativeDateProposals.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 border rounded-lg ${
                        pendingProposals.length > 0 
                          ? 'bg-amber-50 border-amber-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {pendingProposals.length > 0 ? (
                              <>
                                <BellIcon className="h-5 w-5 text-amber-600" />
                                <ClockIcon className="h-5 w-5 text-amber-600" />
                              </>
                            ) : (
                              <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            {pendingProposals.length > 0 ? (
                              <>
                                <p className="text-amber-800 font-medium">
                                  Tienes {pendingProposals.length} propuesta{pendingProposals.length > 1 ? 's' : ''} pendiente{pendingProposals.length > 1 ? 's' : ''}
                                </p>
                                <p className="text-amber-700 text-sm">
                                  {pendingProposals.length === 1 
                                    ? 'Un técnico ha propuesto una fecha alternativa para tu solicitud'
                                    : `${pendingProposals.length} técnicos han propuesto fechas alternativas para tu solicitud`
                                  }
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-blue-800 font-medium">
                                  Propuestas de fechas alternativas
                                </p>
                                <p className="text-blue-700 text-sm">
                                  {request.alternativeDateProposals.length} propuesta{request.alternativeDateProposals.length > 1 ? 's' : ''} recibida{request.alternativeDateProposals.length > 1 ? 's' : ''}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleProposalsExpansion(request.id)}
                          className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
                            pendingProposals.length > 0
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span>{isExpanded ? 'Ocultar propuestas' : 'Ver propuestas'}</span>
                          {isExpanded ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Mostrar propuestas de fechas alternativas (expandible) */}
                  {request.alternativeDateProposals && request.alternativeDateProposals.length > 0 && (
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: isExpanded ? 'auto' : 0,
                        opacity: isExpanded ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Propuestas de fechas alternativas ({request.alternativeDateProposals.length})
                        </h4>
                        {request.alternativeDateProposals
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((proposal) => (
                            <AlternativeDateProposalCard
                              key={proposal.id}
                              proposal={proposal}
                              isClient={true}
                              onAccept={handleAcceptAlternativeDate}
                              onReject={handleRejectAlternativeDate}
                            />
                          ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-4">
                    {request.status === 'pending' && (
                      <div className="flex items-center justify-between p-3 rounded-lg">
                        <button
                          onClick={() => handleCancelClick(request.id)}
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
            )
          })}
        </div>
      )}

      {/* Modal de confirmación para cancelar solicitud */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        title="Cancelar Solicitud"
        message="¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer."
        confirmText="Sí, Cancelar"
        cancelText="No, Mantener"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        isLoading={isCancelling}
      />
    </DashboardPanel>
  )
}