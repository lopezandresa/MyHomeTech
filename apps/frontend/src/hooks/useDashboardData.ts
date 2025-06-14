import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRealTimeClientNotifications } from './useRealTimeClientNotifications'
import { useRealTimeServiceRequests, ConnectionState } from './useRealTimeServiceRequests'
import { serviceRequestService } from '../services/serviceRequestService'
import type { ServiceRequest } from '../types/index'

export const useDashboardData = () => {
  const { user } = useAuth()
  const isClient = user?.role === 'client'
  const isTechnician = user?.role === 'technician'
  
  // Estados compartidos
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados específicos para cliente
  const [clientRequests, setClientRequests] = useState<ServiceRequest[]>([])
  const [requestFilter, setRequestFilter] = useState<'in-progress' | 'all'>('in-progress')
  
  // Estados específicos para técnico
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([])
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([])
  
  // Hooks de notificaciones
  const clientNotifications = useRealTimeClientNotifications(isClient ? user?.id : undefined)
  const technicianNotifications = useRealTimeServiceRequests(isTechnician ? user?.id : undefined)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (isClient) {
        const clientData = await serviceRequestService.getClientRequests(user!.id)
        setClientRequests(clientData)
      } else if (isTechnician) {
        if (technicianNotifications.connectionStatus.state !== ConnectionState.CONNECTED) {
          setIsLoading(false)
          return
        }
        
        const [pending, assigned] = await Promise.all([
          serviceRequestService.getPendingRequestsForMe(),
          serviceRequestService.getTechnicianRequests(user!.id)
        ])
        setPendingRequests(pending)
        setMyRequests(assigned)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Efectos para cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // Efectos para técnicos
  useEffect(() => {
    if (user && isTechnician) {
      technicianNotifications.requestNotificationPermission()
      if (technicianNotifications.connectionStatus.state !== ConnectionState.CONNECTED) {
        technicianNotifications.forceReconnect()
      }
    }
  }, [user?.id, isTechnician])

  // Efecto para actualizar lista con notificaciones de técnicos
  useEffect(() => {
    if (isTechnician && technicianNotifications.notifications.length > 0) {
      const latestNotification = technicianNotifications.notifications[0]
      
      if (latestNotification.type === 'new') {
        setPendingRequests(prev => {
          const exists = prev.some(req => req.id === latestNotification.serviceRequest.id)
          if (!exists) {
            return [latestNotification.serviceRequest, ...prev]
          }
          return prev
        })
      } else if (latestNotification.type === 'removed') {
        setPendingRequests(prev => 
          prev.filter(req => req.id !== latestNotification.serviceRequest.id)
        )
      } else if (latestNotification.type === 'updated') {
        setPendingRequests(prev => 
          prev.map(req => 
            req.id === latestNotification.serviceRequest.id 
              ? latestNotification.serviceRequest 
              : req
          )
        )
      }
      
      if (latestNotification.type === 'new' || latestNotification.type === 'updated') {
        setTimeout(() => {
          serviceRequestService.getTechnicianRequests(user!.id).then(setMyRequests)
        }, 500)
      }
    }
  }, [isTechnician, technicianNotifications.notifications, user?.id])

  // Efecto para actualizar lista con notificaciones de clientes
  useEffect(() => {
    if (isClient && clientNotifications.notifications.length > 0) {
      const latestNotification = clientNotifications.notifications[0]
      
      if (latestNotification.type === 'offer' || latestNotification.type === 'accepted' || 
          latestNotification.type === 'scheduled' || latestNotification.type === 'completed') {
        setClientRequests(prev => {
          const existingIndex = prev.findIndex(req => req.id === latestNotification.serviceRequest.id)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = latestNotification.serviceRequest
            return updated
          } else {
            return [latestNotification.serviceRequest, ...prev]
          }
        })
        
        setTimeout(() => {
          serviceRequestService.getClientRequests(user!.id).then(setClientRequests)
        }, 1000)
      }
      
      if (latestNotification.type === 'expired') {
        setClientRequests(prev => 
          prev.map(req => 
            req.id === latestNotification.serviceRequest.id 
              ? { ...req, status: 'expired' }
              : req
          )
        )
      }
    }
  }, [isClient, clientNotifications.notifications, user?.id])

  // Efectos de reconexión
  useEffect(() => {
    if (isTechnician && technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED && user?.id) {
      loadData()
    }
  }, [isTechnician, technicianNotifications.connectionStatus.state, user?.id])

  useEffect(() => {
    if (isClient && clientNotifications.isConnected && user?.id) {
      loadData()
    }
  }, [isClient, clientNotifications.isConnected, user?.id])

  // Actualización automática periódica
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      if (!isLoading) {
        loadData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user?.id, isLoading])

  // Efecto para recarga cuando se crea una nueva solicitud
  useEffect(() => {
    if (isClient && clientRequests.length > 0) {
      const latestRequest = clientRequests[0]
      const now = new Date()
      const requestCreated = new Date(latestRequest.createdAt)
      const timeDiff = now.getTime() - requestCreated.getTime()
      
      if (timeDiff < 5000) {
        setTimeout(() => loadData(), 1000)
      }
    }
  }, [isClient, clientRequests.length])

  return {
    // Estado
    isLoading,
    error,
    setError,
    clientRequests,
    setClientRequests,
    requestFilter,
    setRequestFilter,
    pendingRequests,
    setPendingRequests,
    myRequests,
    setMyRequests,
    
    // Datos del usuario
    user,
    isClient,
    isTechnician,
    
    // Notificaciones
    clientNotifications,
    technicianNotifications,
    
    // Funciones
    loadData
  }
}