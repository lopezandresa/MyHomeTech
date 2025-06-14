import { useState, useEffect, useCallback, useMemo } from 'react'
import { io } from 'socket.io-client'
import type { ServiceRequest } from '../types'

interface ClientNotification {
  serviceRequest: ServiceRequest
  message: string
  type: 'expired' | 'offer' | 'accepted' | 'scheduled' | 'completed' | 'cancelled'
  timestamp: Date
  id: string
  read: boolean
}

interface UseRealTimeClientNotificationsReturn {
  notifications: ClientNotification[]
  isConnected: boolean
  hasUnreadNotifications: boolean
  requestNotificationPermission: () => Promise<void>
  clearNotifications: () => void
  dismissNotification: (index: number) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useRealTimeClientNotifications = (
  clientId?: number
): UseRealTimeClientNotificationsReturn => {
  const [notifications, setNotifications] = useState<ClientNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setHasPermission(permission === 'granted')
    }
  }, [])

  const showBrowserNotification = useCallback((notification: ClientNotification) => {
    if (hasPermission && 'Notification' in window) {
      const title = getNotificationTitle(notification.type)
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `client-notification-${notification.id}`,
        requireInteraction: true,
        data: {
          serviceRequestId: notification.serviceRequest.id,
          type: notification.type
        }
      }

      const browserNotification = new Notification(title, options)
      
      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
      }

      // Auto cerrar después de 8 segundos
      setTimeout(() => {
        browserNotification.close()
      }, 8000)
    }
  }, [hasPermission])

  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case 'expired':
        return '⏰ Solicitud Expirada'
      case 'offer':
        return '💰 Nueva Oferta Recibida'
      case 'accepted':
        return '✅ Solicitud Aceptada'
      case 'scheduled':
        return '📅 Servicio Programado'
      case 'completed':
        return '🎉 Servicio Completado'
      case 'cancelled':
        return '❌ Servicio Cancelado'
      default:
        return '🔔 Actualización de Solicitud'
    }
  }

  const addNotification = useCallback((notification: Omit<ClientNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: ClientNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Mantener solo 50 notificaciones
    showBrowserNotification(newNotification)
    
    // Disparar evento para actualizar datos del dashboard
    window.dispatchEvent(new CustomEvent('clientNotificationReceived', { 
      detail: { 
        notification: newNotification,
        serviceRequest: newNotification.serviceRequest,
        type: newNotification.type
      } 
    }))
  }, [showBrowserNotification])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const dismissNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  const hasUnreadNotifications = notifications.some(n => !n.read)
  // Efecto para conectar y configurar socket
  useEffect(() => {
    if (!clientId) return

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)      
      // Unirse a la sala específica del cliente
      newSocket.emit('join-client-room', { clientId })
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })    // Escuchar notificación de solicitud expirada
    newSocket.on('service-request-expired', (data) => {
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: 'expired'
      })
    })    // Escuchar nueva oferta recibida
    newSocket.on('service-request-offer', (data) => {
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: 'offer'
      })
    })    // Escuchar solicitud aceptada
    newSocket.on('service-request-accepted', (data) => {
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: 'accepted'
      })
    })    // Escuchar actualizaciones generales
    newSocket.on('service-request-update', (data) => {
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: data.type
      })    })

    return () => {
      if (clientId && newSocket) {
        newSocket.emit('leave-client-room', { clientId })
      }
      newSocket.disconnect()
    }
  }, [clientId, addNotification])
  return useMemo(() => ({
    notifications,
    isConnected,
    hasUnreadNotifications,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    markAsRead,
    markAllAsRead
  }), [
    notifications,
    isConnected,
    hasUnreadNotifications,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    markAsRead,
    markAllAsRead
  ])
}