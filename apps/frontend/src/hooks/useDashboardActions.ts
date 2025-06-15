import { useState, useCallback, useEffect } from 'react'
import serviceRequestService from '../services/serviceRequestService'
import ratingService from '../services/ratingService'
import { useToast } from '../components/common/ToastProvider'
import type { ServiceRequest } from '../types'

/**
 * @fileoverview Hook personalizado para acciones del dashboard
 * 
 * @description Hook que centraliza todas las acciones que pueden realizarse desde el dashboard:
 * - Aceptar/rechazar solicitudes de servicio
 * - Proponer fechas alternativas
 * - Completar servicios
 * - Cancelar solicitudes
 * - Gestionar calificaciones
 * - Estados de modales y formularios
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Interfaz del estado de acciones del dashboard
 * 
 * @interface DashboardActionsState
 * @property {ServiceRequest | null} selectedRequest - Solicitud seleccionada actualmente
 * @property {string | null} error - Error actual de las acciones
 * @property {string | null} success - Mensaje de éxito actual
 * @property {ServiceRequest[]} availableRequests - Lista de solicitudes disponibles
 * @property {ServiceRequest[]} technicianJobs - Trabajos del técnico
 * @property {ServiceRequest[]} clientRequests - Solicitudes del cliente
 * @property {boolean} showNewRequestModal - Si mostrar modal de nueva solicitud
 * @property {string} alternativeDate - Fecha alternativa propuesta
 * @property {boolean} showRatingModal - Si mostrar modal de calificación
 * @property {ServiceRequest | null} selectedRequestForRating - Solicitud a calificar
 * @property {Function} setShowNewRequestModal - Controlar modal de solicitud
 * @property {Function} setAlternativeDate - Establecer fecha alternativa
 * @property {Function} setShowRatingModal - Controlar modal de calificación
 * @property {Function} setSelectedRequestForRating - Establecer solicitud a calificar
 * @property {Function} handleAcceptRequest - Aceptar solicitud
 * @property {Function} handleCompleteRequest - Completar solicitud
 * @property {Function} handleCancelRequest - Cancelar solicitud
 * @property {Function} handleProposeAlternativeDate - Proponer fecha alternativa
 * @property {Function} handleCompleteService - Completar servicio por cliente
 * @property {Function} handleAcceptSpecificOffer - Aceptar oferta específica
 * @property {Function} handleUpdateClientPrice - Actualizar precio del cliente
 * @property {Function} handleAcceptDirectly - Aceptar directamente
 * @property {Function} handleSubmitRating - Enviar calificación
 * @property {Function} handleAcceptAlternativeDate - Aceptar fecha alternativa
 * @property {Function} handleRejectAlternativeDate - Rechazar fecha alternativa
 */
interface DashboardActionsState {
  selectedRequest: ServiceRequest | null
  error: string | null
  success: string | null
  availableRequests: ServiceRequest[]
  technicianJobs: ServiceRequest[]
  clientRequests: ServiceRequest[]
  showNewRequestModal: boolean
  alternativeDate: string
  showRatingModal: boolean
  selectedRequestForRating: ServiceRequest | null
  setShowNewRequestModal: (show: boolean) => void
  setAlternativeDate: (date: string) => void
  setShowRatingModal: (show: boolean) => void
  setSelectedRequestForRating: (request: ServiceRequest | null) => void
  setSelectedRequest: (request: ServiceRequest | null) => void
  setSuccess: (message: string | null) => void
  handleAcceptRequest: (requestId: number, technicianId: number) => Promise<void>
  handleCompleteRequest: (requestId: number, technicianId: number) => Promise<void>
  handleCancelRequest: (requestId: number, technicianId: number, reason: string) => Promise<void>
  handleProposeAlternativeDate: (requestId: number, technicianId: number, alternativeDate: string) => Promise<void>
  handleCompleteService: (requestId: number, clientId: number) => Promise<void>
  handleAcceptSpecificOffer: (requestId: number, offerId: number) => Promise<void>
  handleUpdateClientPrice: (requestId: number, newPrice: number) => Promise<void>
  handleAcceptDirectly: (requestId: number, technicianId: number) => Promise<void>
  handleSubmitRating: (rating: any) => Promise<void>
  handleAcceptAlternativeDate: (requestId: number, clientId: number, proposalId: number) => Promise<void>
  handleRejectAlternativeDate: (requestId: number, clientId: number, proposalId: number) => Promise<void>
}

/**
 * Hook personalizado para acciones del dashboard
 * 
 * @description Hook que centraliza todas las acciones complejas del dashboard:
 * - Gestiona estados locales para modales y formularios
 * - Proporciona funciones para todas las operaciones CRUD
 * - Integra notificaciones toast para feedback al usuario
 * - Maneja errores y estados de éxito
 * - Actualiza listas locales después de operaciones
 * - Dispara eventos para refrescar datos globales
 * 
 * @returns {DashboardActionsState} Objeto con todas las acciones y estados
 * 
 * @example
 * ```typescript
 * function Dashboard() {
 *   const {
 *     handleAcceptRequest,
 *     handleCompleteService,
 *     showNewRequestModal,
 *     setShowNewRequestModal,
 *     error,
 *     success
 *   } = useDashboardActions();
 * 
 *   const onAcceptJob = async (requestId: number) => {
 *     try {
 *       await handleAcceptRequest(requestId, currentUser.id);
 *       // UI se actualiza automáticamente
 *     } catch (error) {
 *       // Error ya manejado por el hook
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {error && <ErrorAlert message={error} />}
 *       {success && <SuccessAlert message={success} />}
 *       <button onClick={() => setShowNewRequestModal(true)}>
 *         Nueva Solicitud
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useDashboardActions = (): DashboardActionsState => {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([])
  const [technicianJobs] = useState<ServiceRequest[]>([])
  const [clientRequests, setClientRequests] = useState<ServiceRequest[]>([])
  // Estados para el modal de nueva solicitud
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  // Estados para fechas alternativas
  const [alternativeDate, setAlternativeDate] = useState('')
  // Estados para calificaciones
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRequestForRating, setSelectedRequestForRating] = useState<ServiceRequest | null>(null)

  // Hook para toasts
  const { showSuccess, showError } = useToast()

  // Efecto para establecer fecha alternativa por defecto cuando se abre el modal
  useEffect(() => {
    if (selectedRequest && !alternativeDate) {
      // Establecer fecha de mañana a las 8:00 AM por defecto
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(8, 0, 0, 0)
      const tomorrowString = tomorrow.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
      setAlternativeDate(tomorrowString)
    } else if (!selectedRequest) {
      // Limpiar fecha cuando se cierra el modal
      setAlternativeDate('')
    }
  }, [selectedRequest, alternativeDate])

  // Función para refrescar datos después de cambios
  const refreshData = useCallback(async () => {
    try {
      // Esta función será llamada desde useDashboardData para refrescar
      window.dispatchEvent(new CustomEvent('refreshDashboardData'))
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }, [])

  /**
   * Acepta una solicitud de servicio por parte del técnico
   * 
   * @description Permite a un técnico aceptar una solicitud disponible,
   * asignándosela y cambiando su estado a 'scheduled'
   * 
   * @param {number} requestId - ID de la solicitud a aceptar
   * @param {number} _technicianId - ID del técnico que acepta (no usado actualmente)
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleAcceptRequest(123, 456);
   * // Solicitud aceptada y asignada al técnico
   * ```
   */
  const handleAcceptRequest = useCallback(async (requestId: number, _technicianId: number) => {
    try {
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
    }
  }, [refreshData, showSuccess, showError])

  /**
   * Completa una solicitud de servicio por parte del técnico
   * 
   * @description Marca una solicitud como completada por el técnico,
   * cambiando el estado a 'completed'
   * 
   * @param {number} requestId - ID de la solicitud a completar
   * @param {number} _technicianId - ID del técnico que completa (no usado actualmente)
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleCompleteRequest(123, 456);
   * // Solicitud marcada como completada
   * ```
   */
  const handleCompleteRequest = useCallback(async (requestId: number, _technicianId: number) => {
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
  }, [refreshData, showSuccess, showError])

  /**
   * Cancela una solicitud de servicio
   * 
   * @description Permite cancelar una solicitud con una razón específica
   * 
   * @param {number} requestId - ID de la solicitud a cancelar
   * @param {number} _technicianId - ID del técnico (no usado actualmente)
   * @param {string} _reason - Razón de la cancelación (no usado actualmente)
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleCancelRequest(123, 456, "Cliente no disponible");
   * // Solicitud cancelada con razón
   * ```
   */
  const handleCancelRequest = useCallback(async (requestId: number, _technicianId: number, _reason: string) => {
    try {
      setError(null)
      await serviceRequestService.cancelRequest(requestId)
      
      // Refrescar datos después del cambio
      await refreshData()
      
      showSuccess('Solicitud Cancelada', 'La solicitud ha sido cancelada exitosamente')
    } catch (error: any) {
      console.error('Error cancelling request:', error)
      showError('Error', 'No se pudo cancelar la solicitud. Inténtalo de nuevo.')
      setError('Error al cancelar la solicitud')
    }
  }, [refreshData, showSuccess, showError])

  /**
   * Propone una fecha alternativa para una solicitud
   * 
   * @description Permite al técnico proponer una fecha diferente
   * si no puede en la fecha solicitada
   * 
   * @param {number} requestId - ID de la solicitud
   * @param {number} _technicianId - ID del técnico (no usado actualmente)
   * @param {string} proposedDate - Nueva fecha propuesta (ISO string)
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleProposeAlternativeDate(123, 456, "2024-12-25T10:00:00Z");
   * // Propuesta de fecha alternativa enviada
   * ```
   */
  const handleProposeAlternativeDate = useCallback(async (requestId: number, _technicianId: number, proposedDate: string) => {
    try {
      setError(null)
      if (!proposedDate) {
        showError('Fecha Requerida', 'Por favor selecciona una fecha y hora')
        return
      }

      // Validación local: verificar que no sea muy similar a propuestas existentes
      const request = availableRequests.find((req: ServiceRequest) => req.id === requestId)
      if (request?.alternativeDateProposals) {
        const proposedTime = new Date(proposedDate).getTime()
        
        for (const existingProposal of request.alternativeDateProposals) {
          const existingTime = new Date(existingProposal.proposedDateTime).getTime()
          
          // Verificar si es exactamente la misma fecha y hora
          if (proposedTime === existingTime) {
            showError('Fecha Duplicada', 'Ya has propuesto esta fecha y hora exacta')
            return
          }
          
          // Verificar si es muy cercana (menos de 30 minutos)
          const timeDifference = Math.abs(proposedTime - existingTime)
          const minutesDifference = timeDifference / (1000 * 60)
          
          if (minutesDifference < 30) {
            const existingDateStr = new Date(existingProposal.proposedDateTime).toLocaleString('es-CO', {
              timeZone: 'America/Bogota',
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            showError(
              'Horarios Muy Cercanos', 
              `Ya tienes una propuesta muy cercana (${existingDateStr}). Las propuestas deben tener al menos 30 minutos de diferencia.`
            )
            return
          }
        }
      }

      await serviceRequestService.proposeAlternativeDate(requestId, proposedDate)
      
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
  }, [availableRequests, refreshData, showSuccess, showError])

  /**
   * Completa un servicio desde la perspectiva del cliente
   * 
   * @description Permite al cliente marcar un servicio como completado
   * y proceder a la calificación
   * 
   * @param {number} requestId - ID de la solicitud a completar
   * @param {number} _clientId - ID del cliente (no usado actualmente)
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleCompleteService(123, 789);
   * // Servicio marcado como completado por el cliente
   * ```
   */
  const handleCompleteService = useCallback(async (requestId: number, _clientId: number) => {
    try {
      setError(null)
      
      // Obtener la solicitud directamente del servicio para asegurar datos actualizados
      const request = await serviceRequestService.getRequestById(requestId)
      if (request) {
        setSelectedRequestForRating(request)
        setShowRatingModal(true)
      } else {
        showError('Error', 'No se pudo encontrar la solicitud')
      }
      
    } catch (error) {
      console.error('Error opening rating modal:', error)
      showError('Error', 'No se pudo cargar la información de la solicitud')
    }
  }, [showError])

  /**
   * Acepta una oferta específica de técnico
   * 
   * @description Permite al cliente aceptar una oferta específica
   * de un técnico en particular
   * 
   * @param {number} requestId - ID de la solicitud
   * @param {number} offerId - ID de la oferta a aceptar
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleAcceptSpecificOffer(123, 456);
   * // Oferta específica aceptada
   * ```
   */
  const handleAcceptSpecificOffer = useCallback(async (requestId: number, offerId: number) => {
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
  }, [])

  /**
   * Actualiza el precio ofrecido por el cliente
   * 
   * @description Permite al cliente modificar el precio que está
   * dispuesto a pagar por el servicio
   * 
   * @param {number} requestId - ID de la solicitud
   * @param {number} newPrice - Nuevo precio ofrecido
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleUpdateClientPrice(123, 75000);
   * // Precio actualizado a $75,000
   * ```
   */
  const handleUpdateClientPrice = useCallback(async (requestId: number, newPrice: number) => {
    try {
      setError(null)
      console.log('Actualizar precio del cliente no implementado aún:', requestId, newPrice)
      setClientRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, clientPrice: newPrice }
            : req
        )
      )
    } catch (error) {
      console.error('Error updating client price:', error)
      setError('Error al actualizar el precio')
    }
  }, [])

  /**
   * Acepta directamente una solicitud sin negociación
   * 
   * @description Permite al técnico aceptar directamente una solicitud
   * en la fecha y precio propuestos originalmente
   * 
   * @param {number} requestId - ID de la solicitud
   * @param {number} _technicianId - ID del técnico (no usado actualmente)
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleAcceptDirectly(123, 456);
   * // Solicitud aceptada directamente
   * ```
   */
  const handleAcceptDirectly = useCallback(async (requestId: number, _technicianId: number) => {
    try {
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

  /**
   * Envía una calificación para un servicio completado
   * 
   * @description Permite calificar un técnico después de completar un servicio
   * 
   * @param {Object} ratingData - Objeto con datos de calificación
   * @param {number} ratingData.score - Puntuación (1-5)
   * @param {string} [ratingData.comment] - Comentario opcional
   * @throws {Error} Si falla el envío de la calificación
   * 
   * @example
   * ```typescript
   * await handleSubmitRating({
   *   score: 5,
   *   comment: "Excelente servicio"
   * });
   * // Calificación enviada exitosamente
   * ```
   */
  const handleSubmitRating = useCallback(async (ratingData: { score: number; comment?: string }) => {
    try {
      setError(null)
      if (!selectedRequestForRating) {
        setError('No hay solicitud seleccionada para calificar')
        return
      }

      if (!ratingData.score) {
        setError('Por favor selecciona una calificación')
        return
      }

      // Primero marcar como completado el servicio
      await serviceRequestService.completeRequest(selectedRequestForRating.id)
      
      // Luego enviar la calificación usando el servicio de rating
      await ratingService.createRating({
        raterId: selectedRequestForRating.clientId,
        ratedId: selectedRequestForRating.technicianId!,
        score: ratingData.score,
        comment: ratingData.comment || undefined,
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

  /**
   * Acepta una fecha alternativa propuesta por un técnico
   * 
   * @description Permite al cliente aceptar una nueva fecha propuesta
   * 
   * @param {number} _requestId - ID de la solicitud (no usado actualmente)
   * @param {number} _clientId - ID del cliente (no usado actualmente)
   * @param {number} proposalId - ID de la propuesta de fecha
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleAcceptAlternativeDate(123, 789, 456);
   * // Fecha alternativa aceptada
   * ```
   */
  const handleAcceptAlternativeDate = useCallback(async (_requestId: number, _clientId: number, proposalId: number) => {
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
  }, [refreshData, showSuccess, showError])

  /**
   * Rechaza una fecha alternativa propuesta por un técnico
   * 
   * @description Permite al cliente rechazar una nueva fecha propuesta
   * 
   * @param {number} _requestId - ID de la solicitud (no usado actualmente)
   * @param {number} _clientId - ID del cliente (no usado actualmente)
   * @param {number} proposalId - ID de la propuesta de fecha
   * @throws {Error} Si falla la operación en el servidor
   * 
   * @example
   * ```typescript
   * await handleRejectAlternativeDate(123, 789, 456);
   * // Fecha alternativa rechazada
   * ```
   */
  const handleRejectAlternativeDate = useCallback(async (_requestId: number, _clientId: number, proposalId: number) => {
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
  }, [refreshData, showSuccess, showError])

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return {
    selectedRequest,
    error,
    success,
    availableRequests,
    technicianJobs,
    clientRequests,
    showNewRequestModal,
    setShowNewRequestModal,
    alternativeDate,
    setAlternativeDate,
    showRatingModal,
    setShowRatingModal,
    selectedRequestForRating,
    setSelectedRequestForRating,
    setSelectedRequest,
    setSuccess,
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