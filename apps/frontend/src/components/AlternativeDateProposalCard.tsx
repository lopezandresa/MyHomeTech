import React from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  CheckIcon, 
  XMarkIcon,
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline'
import TechnicianInfo from './TechnicianInfo'
import type { AlternativeDateProposal } from '../types'

interface AlternativeDateProposalCardProps {
  proposal: AlternativeDateProposal
  isClient: boolean
  onAccept?: (proposalId: number) => Promise<void>
  onReject?: (proposalId: number) => Promise<void>
  isLoading?: boolean
}

const AlternativeDateProposalCard: React.FC<AlternativeDateProposalCardProps> = ({
  proposal,
  isClient,
  onAccept,
  onReject,
  isLoading = false
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false)
  const handleAccept = async () => {
    if (!onAccept || isProcessing) return
    setIsProcessing(true)
    try {
      await onAccept(proposal.id)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!onReject || isProcessing) return
    setIsProcessing(true)
    try {
      await onReject(proposal.id)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'accepted':
        return 'Aceptada'
      case 'rejected':
        return 'Rechazada'
      default:
        return 'Desconocido'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
    >
      {/* Header con técnico y estado */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <TechnicianInfo 
            technician={proposal.technician}
            compact={true}
            showRatingsButton={true}
            proposalCount={proposal.proposalCount}
          />
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
          {getStatusText(proposal.status)}
        </span>
      </div>

      {/* Fecha y hora propuesta */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center mb-2">
          <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-800">Nueva fecha propuesta:</h4>
        </div>
        <div className="flex items-center text-blue-700">
          <ClockIcon className="h-4 w-4 mr-2" />
          <span className="text-lg font-semibold">
            {formatDate(proposal.proposedDateTime)} a las {formatTime(proposal.proposedDateTime)}
          </span>
        </div>
      </div>

      {/* Comentario del técnico */}
      {proposal.comment && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start">
            <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Comentario del técnico:</h4>
              <p className="text-sm text-gray-600">{proposal.comment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información de tiempo */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <div className="flex justify-between">
          <span>Propuesta enviada: {formatDate(proposal.createdAt)}</span>
          {proposal.resolvedAt && (
            <span>
              {proposal.status === 'accepted' ? 'Aceptada' : 'Rechazada'}: {formatDate(proposal.resolvedAt)}
            </span>
          )}
        </div>
      </div>      {/* Botones de acción (solo para clientes y propuestas pendientes) */}
      {isClient && proposal.status === 'pending' && onAccept && onReject && (
        <div className="flex space-x-3 pt-2 border-t">
          <button
            onClick={handleAccept}
            disabled={isProcessing || isLoading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Aceptar fecha
              </>
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing || isLoading}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <XMarkIcon className="h-4 w-4" />
                Rechazar
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default AlternativeDateProposalCard