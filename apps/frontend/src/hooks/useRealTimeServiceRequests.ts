import { useEffect, useCallback, useState, useRef, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import webSocketService from '../services/webSocketService'
import type { ServiceRequest } from '../types/index'

interface ServiceRequestNotification {
  serviceRequest: ServiceRequest
  message: string
  timestamp: Date
  type: 'new' | 'updated' | 'removed'
  latency?: number // Tiempo desde el evento hasta la recepción
}

// Connection states optimizados
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
} as const

export type ConnectionStateType = typeof ConnectionState[keyof typeof ConnectionState]

interface ConnectionStatus {
  connected: boolean
  attempts: number
  maxAttempts: number
  nextAttemptIn: number | null
  state: ConnectionStateType
  latency: number
  quality: 'excellent' | 'good' | 'poor' | 'disconnected'
  pendingEvents: number
  socketId: string | null
}

export const useRealTimeServiceRequests = (technicianId?: number) => {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<ServiceRequestNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    attempts: 0,
    maxAttempts: 50,
    nextAttemptIn: null,
    state: ConnectionState.DISCONNECTED,
    latency: 0,
    quality: 'disconnected',
    pendingEvents: 0,
    socketId: null
  })

  // Referencias para intervalos optimizados
  const checkIntervalRef = useRef<number | null>(null)
  const statusCheckIntervalRef = useRef<number | null>(null)

  // Función para calcular latencia de eventos
  const calculateEventLatency = useCallback((serverTimestamp: number): number => {
    return Date.now() - serverTimestamp
  }, [])

  // Callback optimizado para nuevas solicitudes con tracking de latencia
  const handleNewServiceRequest = useCallback((data: { 
    serviceRequest: ServiceRequest, 
    message: string, 
    timestamp: number
  }) => {
    const eventLatency = calculateEventLatency(data.timestamp)
    
    const notification: ServiceRequestNotification = {
      serviceRequest: data.serviceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'new',
      latency: eventLatency
    }
    
    console.log(`⚡ New request received in ${eventLatency}ms - Ultra-fast!`)
    
    // Optimización: usar función de actualización con callback para mejor rendimiento
    setNotifications(prev => {
      const newNotifications = [notification, ...prev.slice(0, 9)]
      return newNotifications
    })
    
    // Disparar evento inmediato para actualizar dashboard
    const customEvent = new CustomEvent('newServiceRequestReceived', { 
      detail: { serviceRequest: data.serviceRequest, latency: eventLatency }
    })
    window.dispatchEvent(customEvent)
    
    // Notificación del navegador optimizada
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification('⚡ Nueva Solicitud', {
        body: `${data.serviceRequest.appliance?.name || 'Servicio'} - ${eventLatency}ms`,
        icon: '/favicon.ico',
        tag: `service-request-${data.serviceRequest.id}`,
        requireInteraction: false, // No requerir interacción para ser más rápida
        silent: false
      })
      
      notif.onclick = () => {
        window.focus()
        notif.close()
      }
      
      // Auto-cerrar después de 3 segundos para no saturar
      setTimeout(() => notif.close(), 3000)
    }

    // Sonido de notificación optimizado
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.3 // Volumen más bajo
      audio.play().catch(() => {
        // Manejo silencioso de errores de audio
      })
    } catch {
      // Manejo silencioso de errores
    }
  }, [calculateEventLatency])

  // Callback optimizado para solicitudes actualizadas
  const handleServiceRequestUpdated = useCallback((data: { 
    serviceRequest: ServiceRequest, 
    message: string,
    timestamp: number 
  }) => {
    const eventLatency = calculateEventLatency(data.timestamp)
    
    const notification: ServiceRequestNotification = {
      serviceRequest: data.serviceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'updated',
      latency: eventLatency
    }
    
    console.log(`🔄 Request updated in ${eventLatency}ms`)
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
    
    // Evento de actualización inmediata
    window.dispatchEvent(new CustomEvent('serviceRequestUpdated', { 
      detail: { serviceRequest: data.serviceRequest, latency: eventLatency } 
    }))
  }, [calculateEventLatency])

  // Callback optimizado para solicitudes removidas
  const handleServiceRequestRemoved = useCallback((data: { 
    serviceRequestId: number, 
    message: string,
    timestamp: number 
  }) => {
    const eventLatency = calculateEventLatency(data.timestamp)
    
    const notification: ServiceRequestNotification = {
      serviceRequest: { id: data.serviceRequestId } as ServiceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'removed',
      latency: eventLatency
    }
    
    console.log(`❌ Request removed in ${eventLatency}ms`)
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
    
    // Limpiar notificaciones relacionadas para evitar confusión
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(notif => 
          notif.serviceRequest.id !== data.serviceRequestId || 
          notif.type === 'removed'
        )
      )
    }, 100)
    
    // Evento de remoción inmediata
    window.dispatchEvent(new CustomEvent('serviceRequestRemoved', { 
      detail: { serviceRequestId: data.serviceRequestId, latency: eventLatency } 
    }))
  }, [calculateEventLatency])

  // Callback para ofertas rechazadas (optimizado)
  const handleOfferRejected = useCallback((data: { 
    serviceRequest: ServiceRequest, 
    message: string, 
    type: string,
    timestamp: number 
  }) => {
    const eventLatency = calculateEventLatency(data.timestamp)
    
    const notification: ServiceRequestNotification = {
      serviceRequest: data.serviceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'removed',
      latency: eventLatency
    }
    
    console.log(`🚫 Offer rejected in ${eventLatency}ms`)
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
    
    window.dispatchEvent(new CustomEvent('offerRejected', { 
      detail: { serviceRequest: data.serviceRequest, latency: eventLatency } 
    }))
    
    // Notificación del navegador para rechazo
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Oferta rechazada', {
        body: `${data.message} (${eventLatency}ms)`,
        icon: '/favicon.ico',
        tag: `offer-rejected-${data.serviceRequest.id}`
      })
    }
  }, [calculateEventLatency])

  // Función optimizada para verificar conexión y actualizar estado
  const checkAndUpdateConnectionStatus = useCallback(() => {
    if (!token) return false

    const connected = webSocketService.isConnected()
    const status = webSocketService.getConnectionStatus()
    
    // Determinar estado de conexión
    let connectionState: ConnectionStateType
    if (connected) {
      connectionState = ConnectionState.CONNECTED
    } else if (status.attempts > 0) {
      connectionState = ConnectionState.CONNECTING
    } else {
      connectionState = ConnectionState.DISCONNECTED
    }
    
    setIsConnected(connected)
    setConnectionStatus({
      connected,
      attempts: status.attempts,
      maxAttempts: status.maxAttempts,
      nextAttemptIn: status.nextAttemptIn,
      state: connectionState,
      latency: status.latency,
      quality: status.quality,
      pendingEvents: status.pendingEvents,
      socketId: status.socketId
    })
    
    return connected
  }, [token])

  // Función para forzar reconexión instantánea
  const forceReconnect = useCallback(() => {
    if (!token) return
    console.log('🔄 Forcing ultra-fast reconnection...')
    webSocketService.forceReconnect(token)
    
    // Actualizar estado inmediatamente
    setTimeout(() => {
      checkAndUpdateConnectionStatus()
    }, 100)
  }, [token, checkAndUpdateConnectionStatus])

  // Efecto principal para conectar/desconectar WebSocket (OPTIMIZADO)
  useEffect(() => {
    if (!user || user.role !== 'technician' || !token) {
      setIsConnected(false)
      setConnectionStatus(prev => ({
        ...prev,
        state: ConnectionState.DISCONNECTED
      }))
      return
    }

    console.log('🚀 Initializing ultra-fast WebSocket connection...')

    // Estado de conexión inicial
    setConnectionStatus(prev => ({
      ...prev,
      state: ConnectionState.CONNECTING
    }))

    // Conectar al WebSocket con configuración optimizada
    webSocketService.connect(token)
    
    // Verificar estado inmediatamente
    const immediateCheck = setTimeout(() => {
      checkAndUpdateConnectionStatus()
    }, 200) // Reducido de 1000ms a 200ms

    // Configurar listeners de eventos optimizados
    webSocketService.onNewServiceRequest(handleNewServiceRequest)
    webSocketService.onServiceRequestUpdated(handleServiceRequestUpdated)
    webSocketService.onServiceRequestRemoved(handleServiceRequestRemoved)
    webSocketService.onOfferRejected(handleOfferRejected)

    // Verificación de conexión menos frecuente para evitar loops
    if (checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current)
    }
    
    checkIntervalRef.current = window.setInterval(() => {
      const connected = webSocketService.checkConnection(token)
      setIsConnected(connected)
      
      // CORREGIDO: Solo unirse al room si no está ya conectado o si cambió el technicianId
      if (connected && technicianId && !webSocketService.isInTechnicianRoom(technicianId)) {
        console.log('🏠 Joining technician room', technicianId, 'with ultra-fast connection...')
        webSocketService.joinTechnicianRoom(technicianId)
      }
    }, 5000) // CAMBIADO: de 2000ms a 5000ms para reducir spam

    // Verificación de estado de conexión ultra-frecuente
    if (statusCheckIntervalRef.current) {
      window.clearInterval(statusCheckIntervalRef.current)
    }
    
    statusCheckIntervalRef.current = window.setInterval(() => {
      checkAndUpdateConnectionStatus()
    }, 1000) // Estado cada segundo para mayor precisión

    // Cleanup optimizado
    return () => {
      clearTimeout(immediateCheck)
      
      webSocketService.offNewServiceRequest(handleNewServiceRequest)
      webSocketService.offServiceRequestUpdated(handleServiceRequestUpdated)
      webSocketService.offServiceRequestRemoved(handleServiceRequestRemoved)
      webSocketService.offOfferRejected(handleOfferRejected)
      
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      
      if (statusCheckIntervalRef.current) {
        window.clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }
    }
  }, [
    user, 
    token, 
    technicianId,
    handleNewServiceRequest, 
    handleServiceRequestUpdated, 
    handleServiceRequestRemoved,
    handleOfferRejected,
    checkAndUpdateConnectionStatus
  ])

  // Efecto optimizado para unirse a la sala del técnico
  useEffect(() => {
    if (!technicianId || !token || !isConnected) {
      return
    }
    
    console.log(`🏠 Joining technician room ${technicianId} with ultra-fast connection...`)
    
    // Unirse inmediatamente
    webSocketService.joinTechnicianRoom(technicianId)
    
    // Verificar unión después de un breve delay
    const verificationTimer = setTimeout(() => {
      if (webSocketService.isConnected()) {
        webSocketService.joinTechnicianRoom(technicianId)
      }
    }, 500)

    return () => {
      clearTimeout(verificationTimer)
      
      if (webSocketService.isConnected()) {
        webSocketService.leaveTechnicianRoom(technicianId)
      }
    }
  }, [technicianId, isConnected, token])

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

  // Función para marcar notificación como leída
  const dismissNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }, [])

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

  return useMemo(() => ({
    notifications,
    isConnected,
    connectionStatus,
    forceReconnect,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    hasUnreadNotifications: notifications.length > 0,
    performanceMetrics,
    // Función de diagnóstico para desarrollo
    debugConnection: () => webSocketService.debugConnectionStatus()
  }), [
    notifications,
    isConnected,
    connectionStatus,
    forceReconnect,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    performanceMetrics
  ])
}