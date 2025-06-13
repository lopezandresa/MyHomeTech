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
  private maxConnectionAttempts: number = 10;
  
  connect(token: string): void {
    console.log('🔌 Attempting to connect to WebSocket server...');
    
    if (this.socket?.connected) {
      console.log('✅ Already connected to WebSocket server');
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

    console.log('🌐 Creating socket connection to:', import.meta.env.VITE_API_URL || 'http://localhost:3000');

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      console.log('🔗 Socket ID:', this.socket?.id)
      console.log('🏠 Current technician ID:', this.currentTechnicianId)
      
      // Reset reconnection parameters
      this.reconnectInterval = 1000
      this.connectionAttempts = 0
      
      // Si estábamos en una sala antes, volver a unirse
      if (this.currentTechnicianId) {
        console.log('🔄 Rejoining technician room:', this.currentTechnicianId)
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
  }  joinTechnicianRoom(technicianId: number): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, will join room when connected')
      this.currentTechnicianId = technicianId // Save for when we connect
      this.persistTechnicianRoom(technicianId);
      return
    }

    // Leave previous room if any
    if (this.currentTechnicianId && this.currentTechnicianId !== technicianId) {
      this.leaveTechnicianRoom(this.currentTechnicianId)
    }
    
    this.currentTechnicianId = technicianId
    this.persistTechnicianRoom(technicianId);
    this.socket.emit('join-technician-room', { technicianId })
    console.log(`🏠 Joined technician room: ${technicianId}`)
      // Añadir una verificación de unión a la sala para asegurar que todo funciona
    setTimeout(() => {
      if (this.socket?.connected) {
        console.log(`🔍 Verifying technician room join for: ${technicianId}`);
        // Reenviar join para asegurar que el backend recibió la solicitud
        this.socket.emit('join-technician-room', { technicianId });
      }
    }, 1000);
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
    // Method to check if WebSocket is connected
  isConnected(): boolean {
    const connected = this.socket?.connected || false;
    console.log('🔌 isConnected check:', { 
      connected, 
      socketExists: !!this.socket,
      socketId: this.socket?.id,
      readyState: this.socket?.connected
    });
    return connected;
  }
  // Method to get connection status
  getConnectionStatus() {
    const connected = this.socket?.connected || false;
    console.log('📊 WebSocket status:', { 
      connected, 
      socketExists: !!this.socket,
      attempts: this.connectionAttempts,
      maxAttempts: this.maxConnectionAttempts 
    });
    
    return {
      connected,
      attempts: this.connectionAttempts,
      maxAttempts: this.maxConnectionAttempts,
      nextAttemptIn: this.reconnectTimer ? this.reconnectInterval : null
    };
  }

  // Method to check connection with token
  checkConnection(token: string): boolean {
    if (!this.socket?.connected && token) {
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        this.connect(token);
      }
    }
    return this.socket?.connected || false;
  }

  // Method to force reconnection
  forceReconnect(token: string): void {
    this.connectionAttempts = 0;
    this.reconnectInterval = 1000;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.disconnect();
    this.connect(token);
  }

  // Debug method to check connection status
  debugConnectionStatus(): void {
    console.log('🔍 WebSocket Debug Info:');
    console.log('Socket exists:', !!this.socket);
    console.log('Socket connected:', this.socket?.connected);
    console.log('Socket ID:', this.socket?.id);
    console.log('Current technician ID:', this.currentTechnicianId);
    console.log('Connection attempts:', this.connectionAttempts);
    console.log('Max attempts:', this.maxConnectionAttempts);
    console.log('Last token exists:', !!this.lastToken);
    console.log('Reconnect timer active:', !!this.reconnectTimer);
  }
}

export const webSocketService = new WebSocketService()

// Expose service for debugging in development
if (import.meta.env.DEV) {
  (window as any).webSocketService = webSocketService;
}

export default webSocketService