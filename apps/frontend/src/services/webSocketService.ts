import { io, Socket } from 'socket.io-client'
import type { ServiceRequest } from '../types/index'

class WebSocketService {
  private socket: Socket | null = null
  private currentTechnicianId: number | null = null
  private currentClientId: number | null = null
  private reconnectInterval: number = 500 // Reducido a 500ms
  private maxReconnectInterval: number = 5000 // Máximo 5s en lugar de 30s
  private reconnectTimer: number | null = null
  private lastToken: string | null = null
  private connectionAttempts: number = 0
  private maxConnectionAttempts: number = 50 // Incrementado para más persistencia
  
  // Métricas de latencia
  private lastPingTime: number = 0
  private currentLatency: number = 0
  private connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected' = 'disconnected'
  
  // Queue de eventos pendientes durante desconexión
  private pendingEvents: Array<{ event: string, data: any, timestamp: number }> = []
  
  connect(token: string): void {
    if (this.socket?.connected) {
      return
    }

    this.lastToken = token

    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // Restaurar IDs desde localStorage
    if (!this.currentTechnicianId) {
      this.currentTechnicianId = this.restoreTechnicianRoom()
    }
    if (!this.currentClientId) {
      this.currentClientId = this.restoreClientRoom()
    }

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: this.maxConnectionAttempts,
      reconnectionDelay: this.reconnectInterval,
      reconnectionDelayMax: this.maxReconnectInterval,
      randomizationFactor: 0.1,
      forceNew: false,
      multiplex: false,
      autoConnect: true,
    })

    this.setupOptimizedListeners()
  }

  private setupOptimizedListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.reconnectInterval = 500
      this.connectionAttempts = 0
      this.connectionQuality = 'excellent'
      
      this.startLatencyMonitoring()
      this.processPendingEvents()
      
      if (this.currentTechnicianId) {
        this.joinTechnicianRoom(this.currentTechnicianId)
      }
      
      if (this.currentClientId) {
        this.joinClientRoom(this.currentClientId)
      }
    })

    this.socket.on('disconnect', (reason) => {
      this.connectionQuality = 'disconnected'
      this.stopLatencyMonitoring()
      
      if (reason === 'io server disconnect') {
        setTimeout(() => this.attemptReconnection(), 100)
      } else {
        this.attemptReconnection()
      }
    })

    this.socket.on('connect_error', () => {
      this.connectionQuality = 'poor'
      this.attemptReconnection()
    })

    this.socket.on('room-joined', () => {})
    this.socket.on('room-left', () => {})
    this.socket.on('connection-confirmed', () => {})

    this.socket.on('pong', () => {
      if (this.lastPingTime > 0) {
        this.currentLatency = Date.now() - this.lastPingTime
        this.updateConnectionQuality()
      }
    })

    this.socket.on('reconnect', () => {
      this.reconnectInterval = 500
      this.connectionAttempts = 0
      this.connectionQuality = 'good'
    })

    this.socket.on('reconnect_attempt', () => {})
    this.socket.on('reconnect_error', () => {
      this.attemptReconnection()
    })

    this.socket.on('reconnect_failed', () => {
      this.attemptReconnection()
    })
  }

  private attemptReconnection(): void {
    if (this.reconnectTimer || !this.lastToken) {
      return
    }

    this.connectionAttempts++
    
    if (this.connectionAttempts > this.maxConnectionAttempts) {
      // No detener completamente, sino usar intervalos más largos
      this.reconnectInterval = Math.min(this.reconnectInterval * 1.2, 10000)
    }
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      
      // Incremento más suave del intervalo
      this.reconnectInterval = Math.min(
        this.reconnectInterval * 1.2, 
        this.maxReconnectInterval
      )
      
      if (this.lastToken) {
        this.connect(this.lastToken)
      }
    }, this.reconnectInterval)
  }

  private startLatencyMonitoring(): void {
    // Ping cada 2 segundos para monitorear latencia
    const pingInterval = setInterval(() => {
      if (!this.socket?.connected) {
        clearInterval(pingInterval)
        return
      }
      
      this.lastPingTime = Date.now()
      this.socket.emit('ping')
    }, 2000)
  }

  private stopLatencyMonitoring(): void {
    this.lastPingTime = 0
    this.currentLatency = 0
  }

  private updateConnectionQuality(): void {
    if (this.currentLatency <= 50) {
      this.connectionQuality = 'excellent'
    } else if (this.currentLatency <= 150) {
      this.connectionQuality = 'good'
    } else {
      this.connectionQuality = 'poor'
    }
  }

  private processPendingEvents(): void {
    if (this.pendingEvents.length === 0) return
    
    this.pendingEvents.forEach(({ event, data }) => {
      this.socket?.emit(event, data)
    })
    
    this.pendingEvents = []
  }

  private queueEvent(event: string, data: any): void {
    this.pendingEvents.push({
      event,
      data,
      timestamp: Date.now()
    })
    
    // Limpiar eventos muy antiguos (más de 30 segundos)
    const thirtySecondsAgo = Date.now() - 30000
    this.pendingEvents = this.pendingEvents.filter(e => e.timestamp > thirtySecondsAgo)
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.currentTechnicianId = null
    this.currentClientId = null
    this.lastToken = null
    this.connectionAttempts = 0
    this.connectionQuality = 'disconnected'
    this.pendingEvents = []
    
    // Limpiar localStorage
    this.persistTechnicianRoom(null)
    this.persistClientRoom(null)
  }

  joinTechnicianRoom(technicianId: number): void {
    this.currentTechnicianId = technicianId
    this.persistTechnicianRoom(technicianId)
    
    if (!this.socket?.connected) {
      this.queueEvent('join-technician-room', { technicianId })
      return
    }

    // Salir de sala anterior si existe
    if (this.currentTechnicianId && this.currentTechnicianId !== technicianId) {
      this.leaveTechnicianRoom(this.currentTechnicianId)
    }
    
    this.socket.emit('join-technician-room', { technicianId })
  }

  leaveTechnicianRoom(technicianId: number): void {
    if (!this.socket?.connected) {
      this.queueEvent('leave-technician-room', { technicianId })
      return
    }

    this.socket.emit('leave-technician-room', { technicianId })
    
    if (this.currentTechnicianId === technicianId) {
      this.currentTechnicianId = null
      this.persistTechnicianRoom(null)
    }
  }

  joinClientRoom(clientId: number): void {
    this.currentClientId = clientId
    this.persistClientRoom(clientId)
    
    if (!this.socket?.connected) {
      this.queueEvent('join-client-room', { clientId })
      return
    }

    if (this.currentClientId && this.currentClientId !== clientId) {
      this.leaveClientRoom(this.currentClientId)
    }
    
    this.socket.emit('join-client-room', { clientId })
  }

  leaveClientRoom(clientId: number): void {
    if (!this.socket?.connected) {
      this.queueEvent('leave-client-room', { clientId })
      return
    }

    this.socket.emit('leave-client-room', { clientId })
    
    if (this.currentClientId === clientId) {
      this.currentClientId = null
      this.persistClientRoom(null)
    }
  }

  // Métodos de persistencia
  private persistTechnicianRoom(technicianId: number | null): void {
    try {
      if (technicianId) {
        localStorage.setItem('websocket_technician_id', technicianId.toString())
      } else {
        localStorage.removeItem('websocket_technician_id')
      }
    } catch (e) {
      //console.error('Failed to persist technician ID:', e)
    }
  }

  private persistClientRoom(clientId: number | null): void {
    try {
      if (clientId) {
        localStorage.setItem('websocket_client_id', clientId.toString())
      } else {
        localStorage.removeItem('websocket_client_id')
      }
    } catch (e) {
      //console.error('Failed to persist client ID:', e)
    }
  }

  private restoreTechnicianRoom(): number | null {
    try {
      const storedId = localStorage.getItem('websocket_technician_id')
      if (storedId) {
        const technicianId = parseInt(storedId, 10)
        return !isNaN(technicianId) ? technicianId : null
      }
    } catch (e) {
      //console.error('Failed to restore technician ID:', e)
    }
    return null
  }

  private restoreClientRoom(): number | null {
    try {
      const storedId = localStorage.getItem('websocket_client_id')
      if (storedId) {
        const clientId = parseInt(storedId, 10)
        return !isNaN(clientId) ? clientId : null
      }
    } catch (e) {
      //console.error('Failed to restore client ID:', e)
    }
    return null
  }

  // Event listeners optimizados
  onNewServiceRequest(callback: (data: { serviceRequest: ServiceRequest, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('new-service-request', callback)
  }

  onServiceRequestUpdated(callback: (data: { serviceRequest: ServiceRequest, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('service-request-updated', callback)
  }

  onServiceRequestRemoved(callback: (data: { serviceRequestId: number, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('service-request-removed', (data) => {
      callback(data)
    })
  }

  onOfferRejected(callback: (data: { serviceRequest: ServiceRequest, message: string, type: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('offer-rejected', callback)
  }

  // Listeners para clientes
  onServiceRequestAccepted(callback: (data: { serviceRequest: ServiceRequest, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('service-request-accepted', callback)
  }

  onServiceRequestExpired(callback: (data: { serviceRequest: ServiceRequest, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('service-request-expired', callback)
  }

  onServiceRequestOffer(callback: (data: { serviceRequest: ServiceRequest, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('service-request-offer', callback)
  }

  onAlternativeDateProposal(callback: (data: { serviceRequest: ServiceRequest, proposal: any, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('alternative-date-proposal', callback)
  }

  onProposalAccepted(callback: (data: { serviceRequest: ServiceRequest, proposal: any, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('proposal-accepted', callback)
  }

  onProposalRejected(callback: (data: { serviceRequest: ServiceRequest, proposal: any, message: string, timestamp: number }) => void): void {
    if (!this.socket) return
    this.socket.on('proposal-rejected', callback)
  }

  // Métodos para remover listeners
  offNewServiceRequest(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('new-service-request', callback)
  }

  offServiceRequestUpdated(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('service-request-updated', callback)
  }

  offServiceRequestRemoved(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('service-request-removed', callback)
  }

  offOfferRejected(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('offer-rejected', callback)
  }

  // Métodos para remover listeners de clientes
  offServiceRequestAccepted(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('service-request-accepted', callback)
  }

  offServiceRequestExpired(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('service-request-expired', callback)
  }

  offServiceRequestOffer(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('service-request-offer', callback)
  }

  offAlternativeDateProposal(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('alternative-date-proposal', callback)
  }

  offProposalAccepted(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('proposal-accepted', callback)
  }

  offProposalRejected(callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off('proposal-rejected', callback)
  }

  // Métodos de estado y diagnóstico
  isConnected(): boolean {
    const connected = this.socket?.connected || false
    return connected
  }

  isInTechnicianRoom(technicianId: number): boolean {
    return this.currentTechnicianId === technicianId && (this.socket?.connected || false)
  }

  isInClientRoom(clientId: number): boolean {
    return this.currentClientId === clientId && this.socket?.connected || false
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected(),
      attempts: this.connectionAttempts,
      maxAttempts: this.maxConnectionAttempts,
      nextAttemptIn: this.reconnectTimer ? this.reconnectInterval : null,
      latency: this.currentLatency,
      quality: this.connectionQuality,
      pendingEvents: this.pendingEvents.length,
      socketId: this.socket?.id || null
    }
  }

  checkConnection(token: string): boolean {
    if (!this.socket?.connected && token) {
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        this.connect(token)
      }
    }
    return this.socket?.connected || false
  }

  forceReconnect(token: string): void {
    //console.log('🔄 Forcing immediate reconnection...')
    this.connectionAttempts = 0
    this.reconnectInterval = 500
    
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.disconnect()
    
    // Reconectar inmediatamente
    setTimeout(() => {
      this.connect(token)
    }, 100)
  }

  // Método de diagnóstico avanzado
  getDetailedStatus() {
    return {
      ...this.getConnectionStatus(),
      currentTechnicianId: this.currentTechnicianId,
      currentClientId: this.currentClientId,
      transportType: this.socket?.io?.engine?.transport?.name || 'unknown',
      lastToken: !!this.lastToken,
      reconnectTimer: !!this.reconnectTimer
    }
  }

  debugConnectionStatus(): void {
    //console.table(this.getDetailedStatus())
  }
}

export const webSocketService = new WebSocketService()

// Exponer para debugging en desarrollo
if (import.meta.env.DEV) {
  (window as any).webSocketService = webSocketService
}

export default webSocketService