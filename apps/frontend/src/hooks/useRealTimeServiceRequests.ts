import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import webSocketService from '../services/webSocketService'
import type { ServiceRequest } from '../types/index'

interface ServiceRequestNotification {
  serviceRequest: ServiceRequest
  message: string
  timestamp: Date
  type: 'new' | 'updated' | 'removed'
}

export const useRealTimeServiceRequests = (technicianId?: number) => {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<ServiceRequestNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Callback para nuevas solicitudes
  const handleNewServiceRequest = useCallback((data: { serviceRequest: ServiceRequest, message: string }) => {
    console.log('🔔 New service request:', data)
    
    const notification: ServiceRequestNotification = {
      serviceRequest: data.serviceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'new'
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10 notifications
    
    // Mostrar notificación del sistema si está soportada
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nueva Solicitud de Servicio', {
        body: `${data.serviceRequest.appliance.name} - $${data.serviceRequest.clientPrice}`,
        icon: '/favicon.ico',
        tag: `service-request-${data.serviceRequest.id}`
      })
    }
  }, [])

  // Callback para solicitudes actualizadas
  const handleServiceRequestUpdated = useCallback((data: { serviceRequest: ServiceRequest, message: string }) => {
    console.log('🔄 Service request updated:', data)
    
    const notification: ServiceRequestNotification = {
      serviceRequest: data.serviceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'updated'
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
  }, [])

  // Callback para solicitudes removidas
  const handleServiceRequestRemoved = useCallback((data: { serviceRequestId: number, message: string }) => {
    console.log('❌ Service request removed:', data)
    
    // Remover notificaciones de esta solicitud
    setNotifications(prev => 
      prev.filter(notif => notif.serviceRequest.id !== data.serviceRequestId)
    )
  }, [])

  // Efecto para conectar/desconectar WebSocket
  useEffect(() => {
    if (!user || user.role !== 'technician' || !token) {
      return
    }

    // Conectar al WebSocket
    webSocketService.connect(token)
    setIsConnected(webSocketService.isConnected())

    // Configurar listeners
    webSocketService.onNewServiceRequest(handleNewServiceRequest)
    webSocketService.onServiceRequestUpdated(handleServiceRequestUpdated)
    webSocketService.onServiceRequestRemoved(handleServiceRequestRemoved)

    // Cleanup al desmontar
    return () => {
      webSocketService.offNewServiceRequest(handleNewServiceRequest)
      webSocketService.offServiceRequestUpdated(handleServiceRequestUpdated)
      webSocketService.offServiceRequestRemoved(handleServiceRequestRemoved)
    }
  }, [user, token, handleNewServiceRequest, handleServiceRequestUpdated, handleServiceRequestRemoved])

  // Efecto para unirse a la sala del técnico
  useEffect(() => {
    if (technicianId && isConnected) {
      webSocketService.joinTechnicianRoom(technicianId)
      
      return () => {
        webSocketService.leaveTechnicianRoom(technicianId)
      }
    }
  }, [technicianId, isConnected])

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }, [])

  // Función para limpiar notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Función para marcar notificación como leída (removerla)
  const dismissNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }, [])

  return {
    notifications,
    isConnected,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    hasUnreadNotifications: notifications.length > 0
  }
}