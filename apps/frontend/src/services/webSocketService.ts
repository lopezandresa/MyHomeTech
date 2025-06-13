import { io, Socket } from 'socket.io-client'
import type { ServiceRequest } from '../types/index'

class WebSocketService {
  private socket: Socket | null = null
  private currentTechnicianId: number | null = null

  connect(token: string): void {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.currentTechnicianId = null
    }
  }

  joinTechnicianRoom(technicianId: number): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected')
      return
    }

    // Leave previous room if any
    if (this.currentTechnicianId && this.currentTechnicianId !== technicianId) {
      this.leaveTechnicianRoom(this.currentTechnicianId)
    }

    this.currentTechnicianId = technicianId
    this.socket.emit('join-technician-room', { technicianId })
    console.log(`🏠 Joined technician room: ${technicianId}`)
  }

  leaveTechnicianRoom(technicianId: number): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('leave-technician-room', { technicianId })
    console.log(`🚪 Left technician room: ${technicianId}`)
    
    if (this.currentTechnicianId === technicianId) {
      this.currentTechnicianId = null
    }
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
    return this.socket?.connected || false
  }
}

export const webSocketService = new WebSocketService()
export default webSocketService