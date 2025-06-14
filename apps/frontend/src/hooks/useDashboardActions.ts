import { useState, useCallback } from 'react'
import serviceRequestService from '../services/serviceRequestService'
import ratingService from '../services/ratingService'
import { useToast } from '../components/common/ToastProvider'
import type { ServiceRequest } from '../types'

interface DashboardActionsState {
  selectedRequest: ServiceRequest | null
  setSelectedRequest: (request: ServiceRequest | null) => void
  error: string | null
  setError: (error: string | null) => void
  success: string | null
  setSuccess: (success: string | null) => void
  availableRequests: ServiceRequest[]
  setAvailableRequests: (requests: ServiceRequest[] | ((prev: ServiceRequest[]) => ServiceRequest[])) => void
  technicianJobs: ServiceRequest[]
  setTechnicianJobs: (jobs: ServiceRequest[] | ((prev: ServiceRequest[]) => ServiceRequest[])) => void
  clientRequests: ServiceRequest[]
  setClientRequests: (requests: ServiceRequest[] | ((prev: ServiceRequest[]) => ServiceRequest[])) => void
  // Nuevas propiedades para el modal de nueva solicitud
  showNewRequestModal: boolean
  setShowNewRequestModal: (show: boolean) => void
  // Propiedades para fechas alternativas
  alternativeDate: string
  setAlternativeDate: (date: string) => void
  // Propiedades para rating modal
  showRatingModal: boolean
  setShowRatingModal: (show: boolean) => void
  selectedRequestForRating: ServiceRequest | null
  setSelectedRequestForRating: (request: ServiceRequest | null) => void
  // Funciones de acción
  handleAcceptRequest: (requestId: number) => Promise<void>
  handleCompleteRequest: (requestId: number) => Promise<void>
  handleCancelRequest: (requestId: number) => Promise<void>
  handleProposeAlternativeDate: (requestId: number, alternativeDate: string) => Promise<void>
  handleSubmitRating: (rating: number, comment: string) => Promise<void>
  // Funciones adicionales requeridas por Dashboard.tsx
  handleCompleteService: (requestId: number) => Promise<void>
  handleAcceptSpecificOffer: (requestId: number, offerId: number) => Promise<void>
  handleUpdateClientPrice: (requestId: number, price: number) => Promise<void>
  handleAcceptDirectly: (requestId: number) => Promise<void>
  // Nuevas funciones para propuestas de fechas alternativas
  handleAcceptAlternativeDate: (proposalId: number) => Promise<void>
  handleRejectAlternativeDate: (proposalId: number) => Promise<void>
}

export const useDashboardActions = (): DashboardActionsState => {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([])
  const [technicianJobs, setTechnicianJobs] = useState<ServiceRequest[]>([])
  const [clientRequests, setClientRequests] = useState<ServiceRequest[]>([])
  // Estados para el modal de nueva solicitud
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  // Estados para fechas alternativas
  const [alternativeDate, setAlternativeDate] = useState('')
  // Estados para el modal de rating
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRequestForRating, setSelectedRequestForRating] = useState<ServiceRequest | null>(null)

  // Hook para toasts
  const { showSuccess, showError } = useToast()

  // Función para refrescar datos después de cambios
  const refreshData = useCallback(async () => {
    try {
      // Esta función será llamada desde useDashboardData para refrescar
      window.dispatchEvent(new CustomEvent('refreshDashboardData'))
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }, [])
  const handleAcceptRequest = async (requestId: number) => {    try {
      setError(null)
      await serviceRequestService.acceptRequest(requestId)
      
      // Refrescar datos después del cambio
      await refreshData()

      setSelectedRequest(null)
      showSuccess('¡Éxito!', 'Solicitud aceptada correctamente')
    } catch (error: any) {
      console.error('Error accepting request:', error)
      
      if (error.response?.status === 409) {
        showError('Conflicto de Horario', 'Ya tienes otro servicio programado en ese horario. No puedes aceptar esta solicitud.')
      } else if (error.response?.status === 404) {
        showError('Solicitud No Encontrada', 'La solicitud no existe o ya no está disponible.')
      } else {
        showError('Error', 'No se pudo aceptar la solicitud. Inténtalo de nuevo.')
      }
      setError('Error al aceptar la solicitud')
    }  }
  const handleCompleteRequest = async (requestId: number) => {
    try {
      setError(null)
      await serviceRequestService.completeRequest(requestId)
      
      // Refrescar datos después del cambio
      await refreshData()
      showSuccess('¡Servicio Completado!', 'El servicio se ha marcado como completado')
    } catch (error: any) {
      console.error('Error completing request:', error)
      showError('Error', 'No se pudo completar el servicio. Inténtalo de nuevo.')
      setError('Error al completar la solicitud')
    }
  }
  const handleCancelRequest = async (requestId: number) => {
    try {      setError(null)
      await serviceRequestService.cancelRequest(requestId)
      
      // Refrescar datos después del cambio
      await refreshData()
      
      showSuccess('Solicitud Cancelada', 'La solicitud ha sido cancelada exitosamente')
    } catch (error: any) {
      console.error('Error cancelling request:', error)
      showError('Error', 'No se pudo cancelar la solicitud. Inténtalo de nuevo.')
      setError('Error al cancelar la solicitud')
    }
  }

  const handleProposeAlternativeDate = async (requestId: number, alternativeDate: string, comment?: string) => {
    try {
      setError(null)
      if (!alternativeDate) {
        showError('Fecha Requerida', 'Por favor selecciona una fecha y hora')
        return
      }

      await serviceRequestService.proposeAlternativeDate(requestId, alternativeDate, comment)
      
      // Refrescar datos después del cambio
      await refreshData()

      setAlternativeDate('')
      setSelectedRequest(null)
      showSuccess('¡Fecha Propuesta!', 'La fecha alternativa ha sido enviada al cliente')

    } catch (error: any) {
      console.error('Error proposing alternative date:', error)
      
      if (error.response?.status === 409) {
        showError('Conflicto de Horario', 'Ya tienes otro servicio programado en esa fecha y hora. Elige otra fecha.')
      } else if (error.response?.status === 404) {
        showError('Solicitud No Encontrada', 'La solicitud no existe o ya no está disponible.')
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Fecha inválida'
        showError('Fecha Inválida', message)
      } else {
        showError('Error', 'No se pudo proponer la fecha alternativa. Inténtalo de nuevo.')
      }
      setError('Error al proponer fecha alternativa')
    }
  }

  // Función para manejar completar servicio (ahora abre modal de rating)
  const handleCompleteService = useCallback(async (requestId: number) => {
    try {
      setError(null)
      
      // Encontrar la solicitud para el modal de rating
      const request = clientRequests.find(req => req.id === requestId)
      if (request) {
        setSelectedRequestForRating(request)
        setShowRatingModal(true)
      }
      
    } catch (error) {
      console.error('Error opening rating modal:', error)
      setError('Error al abrir el modal de calificación')
    }
  }, [clientRequests])

  // Función para aceptar oferta específica (mantenida para compatibilidad)
  const handleAcceptSpecificOffer = async (requestId: number, offerId: number) => {
    try {
      setError(null)
      await serviceRequestService.acceptRequest(requestId)
      
      // Actualizar estado de la solicitud a "accepted"
      setAvailableRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'accepted' as any, acceptedOfferId: offerId }
            : req
        )
      )
      setSuccess('Oferta aceptada con éxito')
    } catch (error) {
      console.error('Error accepting specific offer:', error)
      setError('Error al aceptar la oferta')
    }
  }

  // Función para actualizar precio desde el lado del cliente (mantenida para compatibilidad)
  const handleUpdateClientPrice = useCallback(async (requestId: number, price: number) => {
    try {
      setError(null)
      console.log('Actualizar precio del cliente no implementado aún:', requestId, price)
      setClientRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, clientPrice: price }
            : req
        )
      )
    } catch (error) {
      console.error('Error updating client price:', error)
      setError('Error al actualizar el precio')
    }
  }, [])  // Función para aceptar solicitud directamente (aceptar fecha propuesta)
  const handleAcceptDirectly = useCallback(async (requestId: number) => {    try {
      setError(null)
      await serviceRequestService.acceptRequest(requestId)
      
      // Refrescar datos después del cambio
      await refreshData()
      showSuccess('¡Solicitud Aceptada!', 'Has aceptado la fecha propuesta por el cliente')

    } catch (error: any) {
      console.error('Error accepting request directly:', error)
      
      if (error.response?.status === 409) {
        showError('Conflicto de Horario', 'Ya tienes otro servicio programado en ese horario. No puedes aceptar esta solicitud.')
      } else if (error.response?.status === 404) {
        showError('Solicitud No Encontrada', 'La solicitud no existe o ya no está disponible.')
      } else {
        showError('Error', 'No se pudo aceptar la solicitud. Inténtalo de nuevo.')
      }
      setError('Error al aceptar la solicitud')
    }
  }, [refreshData, showSuccess, showError])

  // Función para enviar rating
  const handleSubmitRating = useCallback(async (rating: number, comment: string) => {
    try {
      setError(null)
      if (!selectedRequestForRating) {
        setError('No hay solicitud seleccionada para calificar')
        return
      }

      if (!rating) {
        setError('Por favor selecciona una calificación')
        return
      }

      // Primero marcar como completado el servicio
      await serviceRequestService.completeRequest(selectedRequestForRating.id)
      
      // Luego enviar la calificación usando el servicio de rating
      await ratingService.createRating({
        raterId: selectedRequestForRating.clientId,
        ratedId: selectedRequestForRating.technicianId!,
        score: rating,
        comment: comment || undefined,
        serviceRequestId: selectedRequestForRating.id
      })
      
      // Refrescar datos después del cambio
      await refreshData()

      // Cerrar modal de rating
      setShowRatingModal(false)
      setSelectedRequestForRating(null)
      setSuccess('Calificación enviada con éxito')

    } catch (error) {
      console.error('Error submitting rating:', error)
      setError('Error al enviar la calificación')
    }
  }, [selectedRequestForRating, refreshData])

  // Función para aceptar propuesta de fecha alternativa (cliente)
  const handleAcceptAlternativeDate = useCallback(async (proposalId: number) => {
    try {
      setError(null)
      await serviceRequestService.acceptAlternativeDateProposal(proposalId)
      
      // Refrescar datos después del cambio
      await refreshData()
      showSuccess('¡Propuesta Aceptada!', 'Has aceptado la fecha alternativa propuesta por el técnico')

    } catch (error: any) {
      console.error('Error accepting alternative date proposal:', error)
      
      if (error.response?.status === 409) {
        showError('Conflicto de Horario', 'El técnico ya no está disponible en esa fecha.')
      } else if (error.response?.status === 404) {
        showError('Propuesta No Encontrada', 'La propuesta no existe o ya fue procesada.')
      } else {
        showError('Error', 'No se pudo aceptar la propuesta. Inténtalo de nuevo.')
      }
      setError('Error al aceptar propuesta de fecha alternativa')
    }
  }, [])

  // Función para rechazar propuesta de fecha alternativa (cliente)
  const handleRejectAlternativeDate = useCallback(async (proposalId: number) => {
    try {
      setError(null)
      await serviceRequestService.rejectAlternativeDateProposal(proposalId)
      
      // Refrescar datos después del cambio
      await refreshData()
      showSuccess('Propuesta Rechazada', 'Has rechazado la fecha alternativa. El técnico puede enviar otra propuesta.')

    } catch (error: any) {
      console.error('Error rejecting alternative date proposal:', error)
      
      if (error.response?.status === 404) {
        showError('Propuesta No Encontrada', 'La propuesta no existe o ya fue procesada.')
      } else {
        showError('Error', 'No se pudo rechazar la propuesta. Inténtalo de nuevo.')
      }
      setError('Error al rechazar propuesta de fecha alternativa')
    }
  }, [])

  return {
    selectedRequest,
    setSelectedRequest,
    error,
    setError,
    success,
    setSuccess,
    availableRequests,
    setAvailableRequests,
    technicianJobs,
    setTechnicianJobs,
    clientRequests,
    setClientRequests,
    showNewRequestModal,
    setShowNewRequestModal,
    alternativeDate,
    setAlternativeDate,
    showRatingModal,
    setShowRatingModal,
    selectedRequestForRating,
    setSelectedRequestForRating,
    handleAcceptRequest,
    handleCompleteRequest,
    handleCancelRequest,
    handleProposeAlternativeDate,
    handleCompleteService,
    handleAcceptSpecificOffer,
    handleUpdateClientPrice,
    handleAcceptDirectly,
    handleSubmitRating,
    handleAcceptAlternativeDate,
    handleRejectAlternativeDate,
  }
}