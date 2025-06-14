import { useState, useCallback } from 'react'
import serviceRequestService from '../services/serviceRequestService'
import ratingService from '../services/ratingService'
import type { ServiceRequest } from '../types'

interface DashboardActionsState {
  selectedRequest: ServiceRequest | null
  setSelectedRequest: (request: ServiceRequest | null) => void
  error: string | null
  setError: (error: string | null) => void
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
}

export const useDashboardActions = (): DashboardActionsState => {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
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

  const handleAcceptRequest = async (requestId: number) => {
    try {
      setError(null)
      const updatedRequest = await serviceRequestService.acceptRequest(requestId)
      
      // Remover de solicitudes disponibles
      setAvailableRequests(prev => 
        prev.filter(req => req.id !== requestId)
      )
      
      // Agregar a trabajos del técnico
      setTechnicianJobs(prev => [...prev, updatedRequest])
      
      // Actualizar en solicitudes del cliente si está en la vista
      setClientRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'scheduled', technicianId: updatedRequest.technicianId, scheduledAt: updatedRequest.scheduledAt }
            : req
        )
      )

      setSelectedRequest(null)
    } catch (error) {
      console.error('Error accepting request:', error)
      setError('Error al aceptar la solicitud')
    }
  }

  const handleCompleteRequest = async (requestId: number) => {
    try {
      setError(null)
      const updatedRequest = await serviceRequestService.completeRequest(requestId)
      
      // Actualizar en trabajos del técnico
      setTechnicianJobs(prev => 
        prev.map(job => 
          job.id === requestId 
            ? { ...job, status: 'completed', completedAt: updatedRequest.completedAt }
            : job
        )
      )
      
      // Actualizar en solicitudes del cliente
      setClientRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'completed', completedAt: updatedRequest.completedAt }
            : req
        )
      )
    } catch (error) {
      console.error('Error completing request:', error)
      setError('Error al completar la solicitud')
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    try {
      setError(null)
      await serviceRequestService.cancelRequest(requestId)
      
      // Remover de solicitudes del cliente
      setClientRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : req
        )
      )
      
      // Remover de solicitudes disponibles si estaba ahí
      setAvailableRequests(prev => 
        prev.filter(req => req.id !== requestId)
      )
    } catch (error) {
      console.error('Error cancelling request:', error)
      setError('Error al cancelar la solicitud')
    }
  }

  const handleProposeAlternativeDate = async (requestId: number, alternativeDate: string) => {
    try {
      setError(null)
      if (!alternativeDate) {
        setError('Por favor selecciona una fecha y hora')
        return
      }

      // Llamar al servicio para proponer fecha alternativa
      const updatedRequest = await serviceRequestService.proposeAlternativeDate(requestId, alternativeDate)
      
      // Actualizar en solicitudes disponibles
      setAvailableRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'pending' as const, proposedAlternativeDate: alternativeDate }
            : req
        )
      )

      setAlternativeDate('')
      setSelectedRequest(null)

    } catch (error) {
      console.error('Error proposing alternative date:', error)
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
  }, [])

  // Función para aceptar solicitud directamente (aceptar fecha propuesta)
  const handleAcceptDirectly = useCallback(async (requestId: number) => {
    try {
      setError(null)
      const updatedRequest = await serviceRequestService.acceptRequest(requestId)
      
      // Remover de solicitudes disponibles
      setAvailableRequests(prev => 
        prev.filter(req => req.id !== requestId)
      )
      
      // Agregar a trabajos del técnico
      setTechnicianJobs(prev => [...prev, updatedRequest])
      
      // Actualizar en solicitudes del cliente si está en la vista
      setClientRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'scheduled', technicianId: updatedRequest.technicianId, scheduledAt: updatedRequest.scheduledAt }
            : req
        )
      )

    } catch (error) {
      console.error('Error accepting request directly:', error)
      setError('Error al aceptar la solicitud')
    }
  }, [])

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
        raterId: selectedRequestForRating.clientId, // El cliente califica
        ratedId: selectedRequestForRating.technicianId!, // Al técnico
        score: rating,
        comment: comment || undefined,
        serviceRequestId: selectedRequestForRating.id
      })
      
      // Actualizar en solicitudes del cliente
      setClientRequests(prev => 
        prev.map(req => 
          req.id === selectedRequestForRating.id 
            ? { ...req, status: 'completed', completedAt: new Date().toISOString() }
            : req
        )
      )

      // Cerrar modal de rating
      setShowRatingModal(false)
      setSelectedRequestForRating(null)

    } catch (error) {
      console.error('Error submitting rating:', error)
      setError('Error al enviar la calificación')
    }
  }, [selectedRequestForRating])

  return {
    selectedRequest,
    setSelectedRequest,
    error,
    setError,
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
  }
}