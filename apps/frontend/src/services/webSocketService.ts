import { io, Socket } from 'socket.io-client'
import type { ServiceRequest } from '../types/index'

class WebSocketService {
  private socket: Socket | null = null
  private currentTechnicianId: number | null = null
  private reconnectInterval: number = 1000 // Start with 1 second
  private maxReconnectInterval: number = 30000 // Max 30 seconds
  private reconnectTimer: number | null = null
  private lastToken: string | null = null
  private connectionAttempts: number = 0
  private maxConnectionAttempts: number = 10
  connect(token: string): void {
    if (this.socket?.connected) {
      return
    }

    // Save the token for reconnection
    this.lastToken = token

    // Clear any existing reconnection timer
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // Try to restore technician ID from localStorage
    if (!this.currentTechnicianId) {
      this.currentTechnicianId = this.restoreTechnicianRoom();
    }

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      
      // Reset reconnection parameters
      this.reconnectInterval = 1000
      this.connectionAttempts = 0
      
      // Si estábamos en una sala antes, volver a unirse
      if (this.currentTechnicianId) {
        this.joinTechnicianRoom(this.currentTechnicianId)
      }
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server')
      this.attemptReconnection()
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      this.attemptReconnection()
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected to WebSocket server after ${attemptNumber} attempts`)
      
      // Reset reconnection parameters
      this.reconnectInterval = 1000
      this.connectionAttempts = 0
      
      // Volver a unirse a la sala después de reconectar
      if (this.currentTechnicianId) {
        this.joinTechnicianRoom(this.currentTechnicianId)
      }
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Attempting to reconnect (${attemptNumber})...`)
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnection error:', error)
      this.attemptReconnection()
    })

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed after all attempts')
      this.attemptReconnection()
    })
  }

  private attemptReconnection(): void {
    if (this.reconnectTimer || !this.lastToken) {
      return // Already trying to reconnect or no token
    }

    this.connectionAttempts++
    
    if (this.connectionAttempts > this.maxConnectionAttempts) {
      console.log('⚠️ Max reconnection attempts reached, stopping automatic reconnection')
      return
    }

    console.log(`🔄 Scheduling reconnection attempt in ${this.reconnectInterval / 1000} seconds...`)
    
    this.reconnectTimer = window.setTimeout(() => {
      console.log('🔄 Attempting to reconnect...')
      this.reconnectTimer = null
      
      // Exponential backoff for reconnect interval
      this.reconnectInterval = Math.min(
        this.reconnectInterval * 1.5, 
        this.maxReconnectInterval
      )
      
      if (this.lastToken) {
        this.connect(this.lastToken)
      }
    }, this.reconnectInterval)
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.currentTechnicianId = null
    }
    
    // Clear any reconnection timer
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.lastToken = null
    this.connectionAttempts = 0
  }
  joinTechnicianRoom(technicianId: number): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, will join room when connected')
      this.currentTechnicianId = technicianId // Save for when we connect
      this.persistTechnicianRoom(technicianId);
      return
    }

    // Leave previous room if any
    if (this.currentTechnicianId && this.currentTechnicianId !== technicianId) {
      this.leaveTechnicianRoom(this.currentTechnicianId)
    }    this.currentTechnicianId = technicianId
    this.persistTechnicianRoom(technicianId);
    this.socket.emit('join-technician-room', { technicianId })
    console.log(`🏠 Joined technician room: ${technicianId}`)
    
    // Persist the technician room ID to localStorage
    this.persistTechnicianRoom(technicianId)
  }

  leaveTechnicianRoom(technicianId: number): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('leave-technician-room', { technicianId })
    console.log(`🚪 Left technician room: ${technicianId}`)
      if (this.currentTechnicianId === technicianId) {
      this.currentTechnicianId = null
      this.persistTechnicianRoom(null);
    }
    
    // Remove the technician room ID from localStorage
    this.persistTechnicianRoom(null)
  }

  // Add a persistent identifier to help with reconnection
  private getStorageKey() {
    return 'websocket_technician_id';
  }
  
  // Store the current technician ID in localStorage for reconnection after page refresh
  private persistTechnicianRoom(technicianId: number | null) {
    if (technicianId) {
      try {
        localStorage.setItem(this.getStorageKey(), technicianId.toString());
      } catch (e) {
        console.error('Failed to save technician ID to localStorage:', e);
      }
    } else {
      try {
        localStorage.removeItem(this.getStorageKey());
      } catch (e) {
        console.error('Failed to remove technician ID from localStorage:', e);
      }
    }
  }
  
  // Restore the technician ID from localStorage
  private restoreTechnicianRoom(): number | null {
    try {
      const storedId = localStorage.getItem(this.getStorageKey());
      if (storedId) {
        const technicianId = parseInt(storedId, 10);
        if (!isNaN(technicianId)) {
          return technicianId;
        }
      }
    } catch (e) {
      console.error('Failed to restore technician ID from localStorage:', e);
    }
    return null;
  }

  // Event listeners for service requests
  onNewServiceRequest(callback: (data: { serviceRequest: ServiceRequest, message: string }) => void): void {
    if (!this.socket) return
    this.socket.on('new-service-request', callback)
  }

  onServiceRequestUpdated(callback: (data: { serviceRequest: ServiceRequest, message: string }) => void): void {
    if (!this.socket) return
    this.socket.on('service-request-updated', callback)
  }

  onServiceRequestRemoved(callback: (data: { serviceRequestId: number, message: string }) => void): void {
    if (!this.socket) return
    this.socket.on('service-request-removed', callback)
  }

  // Remove event listeners
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
  
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  // Función para comprobar la conexión y reconectar si es necesario
  checkConnection(token: string): boolean {
    if (!this.socket) {
      this.connect(token);
      return false;
    }
    
    if (!this.socket.connected) {
      // Only try to reconnect if we're not already in the process
      if (!this.reconnectTimer) {
        this.connect(token);
      }
      return false;
    }
    
    return true;
  }
  
  // Method to force an immediate reconnection attempt
  forceReconnect(token: string): void {
    console.log('🔄 Forcing reconnection...')
    
    // Disconnect current socket if it exists
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    // Clear any existing reconnection timer
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    // Reset reconnection parameters
    this.reconnectInterval = 1000
    this.connectionAttempts = 0
    
    // Reconnect
    this.connect(token)
  }
  
  // Get connection details
  getConnectionStatus(): { 
    connected: boolean, 
    attempts: number, 
    maxAttempts: number,
    nextAttemptIn: number | null 
  } {
    return {
      connected: this.socket?.connected || false,
      attempts: this.connectionAttempts,
      maxAttempts: this.maxConnectionAttempts,
      nextAttemptIn: this.reconnectTimer ? this.reconnectInterval : null
    }
  }
}

export const webSocketService = new WebSocketService()
export default webSocketService