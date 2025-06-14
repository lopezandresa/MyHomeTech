import { useState, useEffect, useCallback, useMemo } from 'react'
import serviceRequestService from '../services/serviceRequestService'
import { useAuth } from '../contexts/AuthContext'
import { useRealTimeClientNotifications } from './useRealTimeClientNotifications'
import { useRealTimeServiceRequests } from './useRealTimeServiceRequests'
import type { ServiceRequest, User } from '../types'

interface DashboardData {
  availableRequests: ServiceRequest[]
  technicianJobs: ServiceRequest[]
  clientRequests: ServiceRequest[]
  myRequests: ServiceRequest[]
  pendingRequests: ServiceRequest[]
  loading: boolean
  isLoading: boolean // Alias para compatibilidad
  error: string | null
  user: User | null
  isClient: boolean
  isTechnician: boolean
  requestFilter: string
  technicianNotifications: any
  clientNotifications: any
  refetchData: () => Promise<void>
  loadData: () => Promise<void>
  setError: (error: string | null) => void
  setRequestFilter: (filter: string) => void
  setPendingRequests: (requests: ServiceRequest[] | ((prev: ServiceRequest[]) => ServiceRequest[])) => void
  setClientRequests: (requests: ServiceRequest[] | ((prev: ServiceRequest[]) => ServiceRequest[])) => void
  setMyRequests: (requests: ServiceRequest[] | ((prev: ServiceRequest[]) => ServiceRequest[])) => void
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth()
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([])
  const [technicianJobs, setTechnicianJobs] = useState<ServiceRequest[]>([])
  const [clientRequests, setClientRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestFilter, setRequestFilter] = useState<string>('all')
  const [dataFetched, setDataFetched] = useState(false) // Nuevo flag para evitar fetches múltiples

  // Real-time notifications hooks
  const clientNotifications = useRealTimeClientNotifications(
    user?.role === 'client' ? user.id : undefined
  )
  const technicianNotifications = useRealTimeServiceRequests(
    user?.role === 'technician' ? user.id : undefined
  )

  // Memoized computed values
  const myRequests = useMemo(() => {
    if (user?.role === 'client') {
      return clientRequests
    } else if (user?.role === 'technician') {
      return technicianJobs
    }
    return []
  }, [user?.role, clientRequests, technicianJobs])

  const pendingRequests = useMemo(() => {
    return availableRequests.filter(req => req.status === 'pending')
  }, [availableRequests])

  const fetchTechnicianData = useCallback(async () => {
    if (!user || user.role !== 'technician') return
    
    try {
      // Obtener solicitudes disponibles para el técnico
      const available = await serviceRequestService.getAvailableRequestsForMe()
      setAvailableRequests(available)

      // Obtener trabajos asignados al técnico
      const jobs = await serviceRequestService.getTechnicianRequests(user.id)
      setTechnicianJobs(jobs)
    } catch (error) {
      console.error('Error fetching technician data:', error)
      setError('Error al cargar los datos del técnico')
    }
  }, [user])

  const fetchClientData = useCallback(async () => {
    if (!user || user.role !== 'client') return
    
    try {
      // Obtener solicitudes del cliente CON propuestas de fechas alternativas
      const requests = await serviceRequestService.getMyRequestsWithOffers()
      setClientRequests(requests)
    } catch (error) {
      console.error('Error fetching client data:', error)
      setError('Error al cargar los datos del cliente')
    }
  }, [user])

  const refetchData = useCallback(async () => {
    if (!user || dataFetched) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (user.role === 'technician') {
        await fetchTechnicianData()
      } else if (user.role === 'client') {
        await fetchClientData()
      }
      setDataFetched(true)
    } catch (error) {
      console.error('Error refetching data:', error)
      setError('Error al recargar los datos')
    } finally {
      setLoading(false)
    }
  }, [user, dataFetched, fetchTechnicianData, fetchClientData])

  // Función para cargar datos
  const loadData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      if (user.role === 'client') {
        await fetchClientData()
      } else if (user.role === 'technician') {
        await fetchTechnicianData()
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }, [user, fetchClientData, fetchTechnicianData])

  // Escuchar evento de refresh desde las acciones
  useEffect(() => {
    const handleRefresh = () => {
      loadData()
    }

    window.addEventListener('refreshDashboardData', handleRefresh)
    return () => window.removeEventListener('refreshDashboardData', handleRefresh)
  }, [loadData])

  // Integrar notificaciones en tiempo real para actualizar datos automáticamente
  useEffect(() => {
    if (user?.role === 'client') {
      // Escuchar notificaciones del cliente y refrescar datos cuando sea necesario
      const handleClientNotification = () => {
        // Refrescar datos del cliente cuando hay cambios importantes
        setTimeout(() => loadData(), 1000) // Delay para permitir que el backend procese
      }

      // Agregar listeners para eventos específicos que requieren refresh
      if (clientNotifications.notifications.length > 0) {
        const latestNotification = clientNotifications.notifications[0]
        if (['accepted', 'scheduled', 'completed', 'cancelled'].includes(latestNotification.type)) {
          handleClientNotification()
        }
      }
    } else if (user?.role === 'technician') {
      // Escuchar notificaciones del técnico y refrescar datos cuando sea necesario
      const handleTechnicianNotification = () => {
        // Refrescar datos del técnico cuando hay cambios importantes
        setTimeout(() => loadData(), 1000) // Delay para permitir que el backend procese
      }

      // Agregar listeners para eventos específicos que requieren refresh
      if (technicianNotifications.notifications.length > 0) {
        const latestNotification = technicianNotifications.notifications[0]
        if (['new', 'updated', 'removed'].includes(latestNotification.type)) {
          handleTechnicianNotification()
        }
      }
    }
  }, [user?.role, clientNotifications.notifications, technicianNotifications.notifications, loadData])

  // Cargar datos inicial
  useEffect(() => {
    loadData()
  }, [loadData])

  // Update clientRequests when real-time notifications arrive
  useEffect(() => {
    if (user?.role === 'client' && clientNotifications.notifications.length > 0) {
      const latestNotification = clientNotifications.notifications[0]
      
      setClientRequests(prev => {
        const existingIndex = prev.findIndex(req => req.id === latestNotification.serviceRequest.id)
        if (existingIndex >= 0) {
          // Actualizar solicitud existente
          const updated = [...prev]
          updated[existingIndex] = latestNotification.serviceRequest
          return updated
        } else if (latestNotification.type !== 'expired') {
          // Agregar nueva solicitud (excepto las expiradas)
          return [latestNotification.serviceRequest, ...prev]
        }
        return prev
      })
    }
  }, [user?.role, clientNotifications.notifications])

  // Update availableRequests when real-time notifications arrive for technicians
  useEffect(() => {
    if (user?.role === 'technician' && technicianNotifications.notifications.length > 0) {
      const latestNotification = technicianNotifications.notifications[0]
      
      if (latestNotification.type === 'new') {
        setAvailableRequests(prev => {
          const exists = prev.some(req => req.id === latestNotification.serviceRequest.id)
          if (!exists) {
            return [latestNotification.serviceRequest, ...prev]
          }
          return prev
        })
      } else if (latestNotification.type === 'removed') {
        setAvailableRequests(prev => 
          prev.filter(req => req.id !== latestNotification.serviceRequest.id)
        )
      }
    }
  }, [user?.role, technicianNotifications.notifications])

  // Escuchar eventos custom de WebSocket para actualizar datos automáticamente
  useEffect(() => {
    const handleNewServiceRequest = (event: any) => {
      const { serviceRequest } = event.detail
      if (user?.role === 'technician') {
        setAvailableRequests(prev => {
          const exists = prev.some(req => req.id === serviceRequest.id)
          if (!exists) {
            return [serviceRequest, ...prev]
          }
          return prev
        })
      }
    }

    const handleServiceRequestUpdated = (event: any) => {
      const { serviceRequest } = event.detail
      if (user?.role === 'technician') {
        setAvailableRequests(prev => 
          prev.map(req => 
            req.id === serviceRequest.id ? serviceRequest : req
          )
        )
        setTechnicianJobs(prev => 
          prev.map(req => 
            req.id === serviceRequest.id ? serviceRequest : req
          )
        )
      }
    }

    const handleServiceRequestRemoved = (event: any) => {
      const { serviceRequestId } = event.detail
      if (user?.role === 'technician') {
        setAvailableRequests(prev => 
          prev.filter(req => req.id !== serviceRequestId)
        )
      }
    }

    const handleClientNotification = (event: any) => {
      const { serviceRequest, type } = event.detail
      if (user?.role === 'client') {
        if (['accepted', 'scheduled', 'completed', 'cancelled'].includes(type)) {
          setClientRequests(prev => {
            const existingIndex = prev.findIndex(req => req.id === serviceRequest.id)
            if (existingIndex >= 0) {
              const updated = [...prev]
              updated[existingIndex] = serviceRequest
              return updated
            }
            return prev
          })
        }
      }
    }

    // Agregar listeners para eventos custom
    window.addEventListener('newServiceRequestReceived', handleNewServiceRequest)
    window.addEventListener('serviceRequestUpdated', handleServiceRequestUpdated)
    window.addEventListener('serviceRequestRemoved', handleServiceRequestRemoved)
    window.addEventListener('clientNotificationReceived', handleClientNotification)

    return () => {
      window.removeEventListener('newServiceRequestReceived', handleNewServiceRequest)
      window.removeEventListener('serviceRequestUpdated', handleServiceRequestUpdated)
      window.removeEventListener('serviceRequestRemoved', handleServiceRequestRemoved)
      window.removeEventListener('clientNotificationReceived', handleClientNotification)
    }
  }, [user?.role])

  return {
    availableRequests,
    technicianJobs,
    clientRequests,
    myRequests,
    pendingRequests,
    loading,
    isLoading: loading,
    error,
    user,
    isClient: user?.role === 'client' || false,
    isTechnician: user?.role === 'technician' || false,
    requestFilter,
    technicianNotifications,
    clientNotifications,
    refetchData,
    loadData,
    setError,
    setRequestFilter,
    setPendingRequests: (requests) => {
      if (typeof requests === 'function') {
        setAvailableRequests(prev => requests(prev.filter(req => req.status === 'pending')))
      } else {
        setAvailableRequests(requests)
      }
    },
    setClientRequests: (requests) => {
      if (typeof requests === 'function') {
        setClientRequests(prev => requests(prev))
      } else {
        setClientRequests(requests)
      }
    },
    setMyRequests: (requests) => {
      if (typeof requests === 'function') {
        if (user?.role === 'client') {
          setClientRequests(prev => requests(prev))
        } else if (user?.role === 'technician') {
          setTechnicianJobs(prev => requests(prev))
        }
      } else {
        if (user?.role === 'client') {
          setClientRequests(requests)
        } else if (user?.role === 'technician') {
          setTechnicianJobs(requests)
        }
      }
    },
  }
}