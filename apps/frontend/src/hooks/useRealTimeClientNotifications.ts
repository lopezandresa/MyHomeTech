import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
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
  const [socket, setSocket] = useState<Socket | null>(null)
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

  useEffect(() => {
    if (!clientId) return

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    })

    newSocket.on('connect', () => {
      console.log('Client connected to WebSocket')
      setIsConnected(true)
      
      // Unirse a la sala específica del cliente
      newSocket.emit('join-client-room', { clientId })
    })

    newSocket.on('disconnect', () => {
      console.log('Client disconnected from WebSocket')
      setIsConnected(false)
    })

    // Escuchar notificación de solicitud expirada
    newSocket.on('service-request-expired', (data) => {
      console.log('Service request expired:', data)
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: 'expired'
      })
    })

    // Escuchar nueva oferta recibida
    newSocket.on('service-request-offer', (data) => {
      console.log('New offer received:', data)
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: 'offer'
      })
    })

    // Escuchar solicitud aceptada
    newSocket.on('service-request-accepted', (data) => {
      console.log('Service request accepted:', data)
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: 'accepted'
      })
    })

    // Escuchar actualizaciones generales
    newSocket.on('service-request-update', (data) => {
      console.log('Service request update:', data)
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: data.type
      })
    })

    setSocket(newSocket)

    return () => {
      if (clientId) {
        newSocket.emit('leave-client-room', { clientId })
      }
      newSocket.disconnect()
    }
  }, [clientId, addNotification])

  return {
    notifications,
    isConnected,
    hasUnreadNotifications,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    markAsRead,
    markAllAsRead
  }
}