import { useEffect, useCallback, useState, useRef, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import webSocketService from '../services/webSocketService'
import type { ServiceRequest } from '../types/index'

interface ServiceRequestNotification {
  serviceRequest: ServiceRequest
  message: string
  timestamp: Date
  type: 'new' | 'updated' | 'removed'
}

// Connection states
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
}

export const useRealTimeServiceRequests = (technicianId?: number) => {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<ServiceRequestNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    attempts: 0,
    maxAttempts: 10,
    nextAttemptIn: null,
    state: ConnectionState.DISCONNECTED
  })
  const checkIntervalRef = useRef<number | null>(null)
  const statusCheckIntervalRef = useRef<number | null>(null)  // Callback para nuevas solicitudes
  const handleNewServiceRequest = useCallback((data: { serviceRequest: ServiceRequest, message: string }) => {
    
    const notification: ServiceRequestNotification = {
      serviceRequest: data.serviceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'new'
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10 notifications
    
    // Disparar evento para actualizar datos del dashboard
    window.dispatchEvent(new CustomEvent('newServiceRequestReceived', { 
      detail: { serviceRequest: data.serviceRequest } 
    }))
    
    // Mostrar notificación del sistema si está soportada
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification('Nueva Solicitud de Servicio', {
        body: `${data.serviceRequest.appliance.name} - Cliente: ${data.serviceRequest.client?.firstName}`,
        icon: '/favicon.ico',
        tag: `service-request-${data.serviceRequest.id}`
      });
      
      // Hacer que la notificación llame la atención
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
        // Reproducir sonido de notificación
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {
          // Silently handle audio play errors
        });
      } catch {
        // Silently handle audio errors
      }
    }
  }, [])

  // Callback para solicitudes actualizadas
  const handleServiceRequestUpdated = useCallback((data: { serviceRequest: ServiceRequest, message: string }) => {
    
    const notification: ServiceRequestNotification = {
      serviceRequest: data.serviceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'updated'
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
    
    // Disparar evento para actualizar datos del dashboard
    window.dispatchEvent(new CustomEvent('serviceRequestUpdated', { 
      detail: { serviceRequest: data.serviceRequest } 
    }))
  }, [])

  // Callback para solicitudes removidas
  const handleServiceRequestRemoved = useCallback((data: { serviceRequestId: number, message: string }) => {
    // Crear notificación de solicitud removida
    const notification: ServiceRequestNotification = {
      serviceRequest: { id: data.serviceRequestId } as ServiceRequest, // Crear objeto mínimo
      message: data.message,
      timestamp: new Date(),
      type: 'removed'
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
    
    // Disparar evento para actualizar datos del dashboard
    window.dispatchEvent(new CustomEvent('serviceRequestRemoved', { 
      detail: { serviceRequestId: data.serviceRequestId } 
    }))
    
    // También remover notificaciones previas de esta solicitud para evitar confusión
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(notif => notif.serviceRequest.id !== data.serviceRequestId || notif.type === 'removed')
      )
    }, 100)
  }, [])

  // Callback para ofertas rechazadas
  const handleOfferRejected = useCallback((data: { serviceRequest: ServiceRequest, message: string, type: string }) => {
    const notification: ServiceRequestNotification = {
      serviceRequest: data.serviceRequest,
      message: data.message,
      timestamp: new Date(),
      type: 'removed'
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)])
    
    // Disparar evento para actualizar datos del dashboard
    window.dispatchEvent(new CustomEvent('offerRejected', { 
      detail: { serviceRequest: data.serviceRequest } 
    }))
    
    // Mostrar notificación del sistema
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Oferta rechazada', {
        body: data.message,
        icon: '/favicon.ico'
      })
    }
  }, [])  // Function to check connection and update status
  const checkAndUpdateConnectionStatus = useCallback(() => {
    if (!token) return false;
      const connected = webSocketService.isConnected();
    const status = webSocketService.getConnectionStatus();
    
    // Determine connection state
    let connectionState: ConnectionStateType;
    if (connected) {
      connectionState = ConnectionState.CONNECTED;
    } else if (status.attempts > 0) {
      connectionState = ConnectionState.CONNECTING;    } else {
      connectionState = ConnectionState.DISCONNECTED;
    }
    
    setIsConnected(connected);
    setConnectionStatus({
      ...status,
      state: connectionState
    });
    
    return connected;
  }, [token, technicianId]);

  // Function to force reconnection
  const forceReconnect = useCallback(() => {
    if (!token) return;
    webSocketService.forceReconnect(token);
    checkAndUpdateConnectionStatus();
  }, [token, checkAndUpdateConnectionStatus]);  // Efecto para conectar/desconectar WebSocket
  useEffect(() => {
    if (!user || user.role !== 'technician' || !token) {
      setIsConnected(false);
      setConnectionStatus(prev => ({
        ...prev,
        state: ConnectionState.DISCONNECTED      }));
      return;
    }

    // Set to connecting state when starting connection
    setConnectionStatus(prev => ({
      ...prev,
      state: ConnectionState.CONNECTING
    }));

    // Conectar al WebSocket
    webSocketService.connect(token);
    
    // Verificar estado inmediatamente después de conectar
    setTimeout(() => {
      checkAndUpdateConnectionStatus();
    }, 1000);    // Configurar listeners
    webSocketService.onNewServiceRequest(handleNewServiceRequest);
    webSocketService.onServiceRequestUpdated(handleServiceRequestUpdated);
    webSocketService.onServiceRequestRemoved(handleServiceRequestRemoved);
    webSocketService.onOfferRejected(handleOfferRejected);// Verificar conexión periódicamente (cada 5 segundos en lugar de 15)
    if (checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current);
    }
    
    checkIntervalRef.current = window.setInterval(() => {
      const connected = webSocketService.checkConnection(token);
      setIsConnected(connected);
      
      // Si está conectado y hay un technicianId, asegurarse de que esté en la sala
      if (connected && technicianId) {
        webSocketService.joinTechnicianRoom(technicianId);
      }
    }, 5000); // Reducido de 15000 a 5000
    
    // Verificar estado de conexión más frecuentemente (cada 5 segundos)
    if (statusCheckIntervalRef.current) {
      window.clearInterval(statusCheckIntervalRef.current);
    }
    
    statusCheckIntervalRef.current = window.setInterval(() => {
      checkAndUpdateConnectionStatus();
    }, 5000);    // Cleanup al desmontar
    return () => {
      webSocketService.offNewServiceRequest(handleNewServiceRequest);
      webSocketService.offServiceRequestUpdated(handleServiceRequestUpdated);
      webSocketService.offServiceRequestRemoved(handleServiceRequestRemoved);
      webSocketService.offOfferRejected(handleOfferRejected);
      
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      
      if (statusCheckIntervalRef.current) {
        window.clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [
    user, 
    token, 
    technicianId,
    handleNewServiceRequest, 
    handleServiceRequestUpdated, 
    handleServiceRequestRemoved,
    checkAndUpdateConnectionStatus
  ]);

  // Efecto para unirse a la sala del técnico
  useEffect(() => {
    if (!technicianId || !token) {
      return;
    }
    
    // Asegurarse de que estamos conectados antes de intentar unirse a la sala
    if (!isConnected) {
      const connected = webSocketService.checkConnection(token);
      setIsConnected(connected);
      
      // Si aún no estamos conectados, salir y esperar a la reconexión
      if (!connected) {
        return;
      }
    }
    
    // Intentar unirse a la sala
    webSocketService.joinTechnicianRoom(technicianId);
    
    return () => {
      // Solo intentar salir si estamos conectados
      if (webSocketService.isConnected()) {
        webSocketService.leaveTechnicianRoom(technicianId);
      }
    };
  }, [technicianId, isConnected, token]);
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
  return useMemo(() => ({
    notifications,
    isConnected,
    connectionStatus,
    forceReconnect,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    hasUnreadNotifications: notifications.length > 0
  }), [
    notifications,
    isConnected,
    connectionStatus,
    forceReconnect,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification
  ])
}