import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import webSocketService from '../services/webSocketService'
import type { ServiceRequest } from '../types'

interface ClientNotification {
  id: string
  serviceRequest?: ServiceRequest
  proposal?: any
  message: string
  type: 'accepted' | 'expired' | 'offer' | 'alternative_date_proposal' | 'proposal_accepted' | 'proposal_rejected'
  timestamp: Date
  isRead: boolean
  latency?: number
}

interface UseRealTimeClientNotificationsReturn {
  notifications: ClientNotification[]
  isConnected: boolean
  hasUnreadNotifications: boolean
  requestNotificationPermission: () => Promise<boolean>
  clearNotifications: () => void
  dismissNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  connectionStatus: {
    connected: boolean
    latency: number
    quality: 'excellent' | 'good' | 'poor' | 'disconnected'
    socketId: string | null
  }
  performanceMetrics: {
    averageLatency: number
    minLatency: number
    maxLatency: number
    totalEvents: number
  }
  forceReconnect: () => void
}

export const useRealTimeClientNotifications = (
  clientId?: number
): UseRealTimeClientNotificationsReturn => {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<ClientNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    latency: number
    quality: 'excellent' | 'good' | 'poor' | 'disconnected'
    socketId: string | null
  }>({
    connected: false,
    latency: 0,
    quality: 'disconnected',
    socketId: null
  })

  // Función para calcular latencia de eventos
  const calculateEventLatency = useCallback((serverTimestamp: number): number => {
    return Date.now() - serverTimestamp
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setHasPermission(permission === 'granted')
      return permission === 'granted'
    }
    return false
  }, [])

  const showBrowserNotification = useCallback((notification: ClientNotification) => {
    if (hasPermission && 'Notification' in window) {
      const title = getNotificationTitle(notification.type)
      const latencyText = notification.latency ? ` (${notification.latency}ms)` : ''
      
      const options = {
        body: notification.message + latencyText,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `client-notification-${notification.id}`,
        requireInteraction: false,
        silent: false
      }

      const browserNotif = new Notification(title, options)
      
      browserNotif.onclick = () => {
        window.focus()
        browserNotif.close()
      }

      // Auto-cerrar después de 5 segundos
      setTimeout(() => browserNotif.close(), 5000)
    }
  }, [hasPermission])

  const addNotification = useCallback((data: {
    serviceRequest?: ServiceRequest
    proposal?: any
    message: string
    type: ClientNotification['type']
    timestamp?: number
  }) => {
    const eventLatency = data.timestamp ? calculateEventLatency(data.timestamp) : undefined
    
    const notification: ClientNotification = {
      id: `${Date.now()}-${Math.random()}`,
      serviceRequest: data.serviceRequest,
      proposal: data.proposal,
      message: data.message,
      type: data.type,
      timestamp: new Date(),
      isRead: false,
      latency: eventLatency
    }

    //console.log(`⚡ Client notification received in ${eventLatency || 0}ms:`, notification.type)

    setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Mantener últimas 20
    showBrowserNotification(notification)

    // Disparar evento personalizado para el dashboard
    window.dispatchEvent(new CustomEvent('clientNotificationReceived', {
      detail: { 
        serviceRequest: data.serviceRequest, 
        type: data.type,
        latency: eventLatency 
      }
    }))

    // Sonido de notificación optimizado
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.4
      audio.play().catch(() => {})
    } catch {}
  }, [calculateEventLatency, showBrowserNotification])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }, [])

  // Función para forzar reconexión
  const forceReconnect = useCallback(() => {
    if (clientId && token) {
      //console.log('🔄 Forcing client reconnection...')
      webSocketService.forceReconnect(token)
      setTimeout(() => {
        webSocketService.joinClientRoom(clientId)
      }, 500)
    }
  }, [clientId, token])

  // Efecto principal para manejar conexión WebSocket
  useEffect(() => {
    if (!clientId || !user || user.role !== 'client' || !token) {
      setIsConnected(false)
      setConnectionStatus(prev => ({
        ...prev,
        connected: false
      }))
      return
    }

    //console.log(`🚀 Setting up ultra-fast client WebSocket for client ${clientId}...`)

    // Conectar al WebSocket si no está conectado
    if (!webSocketService.isConnected()) {
      webSocketService.connect(token)
    }

    // Función para actualizar estado de conexión
    const updateConnectionStatus = () => {
      const status = webSocketService.getConnectionStatus()
      setIsConnected(status.connected)
      setConnectionStatus({
        connected: status.connected,
        latency: status.latency,
        quality: status.quality,
        socketId: status.socketId
      })
    }

    // Verificar conexión inmediatamente
    updateConnectionStatus()

    // Unirse a la sala del cliente
    webSocketService.joinClientRoom(clientId)

    // Configurar listeners de eventos específicos del cliente
    const handleServiceRequestAccepted = (data: { 
      serviceRequest: ServiceRequest, 
      message: string,
      timestamp: number 
    }) => {
      addNotification({
        serviceRequest: data.serviceRequest,
        message: data.message,
        type: 'accepted',
        timestamp: data.timestamp
      })
    }

    const handleAlternativeDateProposal = (data: { 
      serviceRequest: ServiceRequest, 
      proposal: any,
      message: string,
      timestamp: number 
    }) => {
      addNotification({
        serviceRequest: data.serviceRequest,
        proposal: data.proposal,
        message: data.message,
        type: 'alternative_date_proposal',
        timestamp: data.timestamp
      })
    }

    const handleProposalAccepted = (data: { 
      serviceRequest: ServiceRequest, 
      proposal: any,
      message: string,
      timestamp: number 
    }) => {
      addNotification({
        serviceRequest: data.serviceRequest,
        proposal: data.proposal,
        message: data.message,
        type: 'proposal_accepted',
        timestamp: data.timestamp
      })
    }

    const handleProposalRejected = (data: { 
      serviceRequest: ServiceRequest, 
      proposal: any,
      message: string,
      timestamp: number 
    }) => {
      addNotification({
        serviceRequest: data.serviceRequest,
        proposal: data.proposal,
        message: data.message,
        type: 'proposal_rejected',
        timestamp: data.timestamp
      })
    }

    // Registrar listeners usando los métodos del servicio
    webSocketService.onServiceRequestAccepted(handleServiceRequestAccepted)
    webSocketService.onAlternativeDateProposal(handleAlternativeDateProposal)
    webSocketService.onProposalAccepted(handleProposalAccepted)
    webSocketService.onProposalRejected(handleProposalRejected)

    // Verificación periódica de conexión (cada 3 segundos)
    const connectionCheckInterval = setInterval(() => {
      updateConnectionStatus()
      
      // Asegurar que seguimos en la sala
      if (webSocketService.isConnected()) {
        webSocketService.joinClientRoom(clientId)
      }
    }, 3000)

    return () => {
      clearInterval(connectionCheckInterval)
      
      // Remover listeners usando los métodos del servicio
      webSocketService.offServiceRequestAccepted(handleServiceRequestAccepted)
      webSocketService.offAlternativeDateProposal(handleAlternativeDateProposal)
      webSocketService.offProposalAccepted(handleProposalAccepted)
      webSocketService.offProposalRejected(handleProposalRejected)
      
      if (webSocketService.isConnected()) {
        webSocketService.leaveClientRoom(clientId)
      }
    }
  }, [clientId, user, token, addNotification])

  // Métricas de rendimiento
  const performanceMetrics = useMemo(() => {
    const recentNotifications = notifications.slice(0, 10)
    const latencies = recentNotifications
      .filter(n => n.latency !== undefined)
      .map(n => n.latency!)
    
    if (latencies.length === 0) {
      return {
        averageLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        totalEvents: notifications.length
      }
    }
    
    return {
      averageLatency: Math.round(latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length),
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      totalEvents: notifications.length
    }
  }, [notifications])

  const hasUnreadNotifications = useMemo(() => {
    return notifications.some(notif => !notif.isRead)
  }, [notifications])

  return useMemo(() => ({
    notifications,
    isConnected,
    hasUnreadNotifications,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    connectionStatus,
    performanceMetrics,
    forceReconnect
  }), [
    notifications,
    isConnected,
    hasUnreadNotifications,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    connectionStatus,
    performanceMetrics,
    forceReconnect
  ])
}

function getNotificationTitle(type: ClientNotification['type']): string {
  switch (type) {
    case 'accepted':
      return '✅ Solicitud Aceptada'
    case 'expired':
      return '⏰ Solicitud Expirada'
    case 'offer':
      return '💰 Nueva Oferta'
    case 'alternative_date_proposal':
      return '📅 Propuesta de Fecha'
    case 'proposal_accepted':
      return '✅ Propuesta Aceptada'
    case 'proposal_rejected':
      return '❌ Propuesta Rechazada'
    default:
      return '🔔 Notificación'
  }
}