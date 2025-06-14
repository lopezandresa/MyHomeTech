import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { ServiceRequest } from '../service-request/service-request.entity';
import { AlternativeDateProposal } from './alternative-date-proposal.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  // Configuraciones para latencia ultra-baja
  pingTimeout: 2000,        // Reducido de 20s a 2s
  pingInterval: 1000,       // Heartbeat cada 1s en lugar de 25s
  upgradeTimeout: 1000,     // Timeout de upgrade a 1s
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  // Configuraciones adicionales para mejor rendimiento
  serveClient: false,
  cookie: false,
})
export class ServiceRequestGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ServiceRequestGateway.name);
  private technicianConnections = new Map<number, Set<string>>(); // technicianId -> Set of socketIds
  private clientConnections = new Map<number, Set<string>>(); // clientId -> Set of socketIds
  
  // Cache de salas activas para optimizar notificaciones
  private activeRooms = new Set<string>();
  
  // Pool de eventos para envío en lotes cuando sea necesario
  private eventQueue = new Map<string, any[]>();
  private flushTimer: NodeJS.Timeout | null = null;

  handleConnection(client: Socket) {
    // Configurar socket para latencia mínima
    client.compress(false); // Desabilitar compresión para velocidad
    
    // Enviar confirmación inmediata de conexión
    client.emit('connection-confirmed', { 
      timestamp: Date.now(),
      socketId: client.id 
    });
  }

  handleDisconnect(client: Socket) {
    // Limpiar conexiones de técnicos
    for (const [technicianId, socketIds] of this.technicianConnections.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.technicianConnections.delete(technicianId);
        this.activeRooms.delete(`technician-${technicianId}`);
      }
    }

    // Limpiar conexiones de clientes
    for (const [clientId, socketIds] of this.clientConnections.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.clientConnections.delete(clientId);
        this.activeRooms.delete(`client-${clientId}`);
      }
    }
  }

  @SubscribeMessage('join-technician-room')
  handleJoinTechnicianRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { technicianId: number }
  ) {
    const { technicianId } = data;
    const roomName = `technician-${technicianId}`;
    
    if (!this.technicianConnections.has(technicianId)) {
      this.technicianConnections.set(technicianId, new Set());
    }
    
    this.technicianConnections.get(technicianId)!.add(client.id);
    client.join(roomName);
    this.activeRooms.add(roomName);
    
    // Confirmar unión inmediatamente
    client.emit('room-joined', { 
      room: roomName, 
      timestamp: Date.now(),
      technicianId 
    });
  }

  @SubscribeMessage('leave-technician-room')
  handleLeaveTechnicianRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { technicianId: number }
  ) {
    const { technicianId } = data;
    const roomName = `technician-${technicianId}`;
    
    client.leave(roomName);
    
    if (this.technicianConnections.has(technicianId)) {
      this.technicianConnections.get(technicianId)!.delete(client.id);
      if (this.technicianConnections.get(technicianId)!.size === 0) {
        this.technicianConnections.delete(technicianId);
        this.activeRooms.delete(roomName);
      }
    }
    
    client.emit('room-left', { 
      room: roomName, 
      timestamp: Date.now() 
    });
  }

  @SubscribeMessage('join-client-room')
  handleJoinClientRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clientId: number }
  ) {
    const { clientId } = data;
    const roomName = `client-${clientId}`;
    
    if (!this.clientConnections.has(clientId)) {
      this.clientConnections.set(clientId, new Set());
    }
    
    this.clientConnections.get(clientId)!.add(client.id);
    client.join(roomName);
    this.activeRooms.add(roomName);
    
    client.emit('room-joined', { 
      room: roomName, 
      timestamp: Date.now(),
      clientId 
    });
  }

  @SubscribeMessage('leave-client-room')
  handleLeaveClientRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clientId: number }
  ) {
    const { clientId } = data;
    const roomName = `client-${clientId}`;
    
    client.leave(roomName);
    
    if (this.clientConnections.has(clientId)) {
      this.clientConnections.get(clientId)!.delete(client.id);
      if (this.clientConnections.get(clientId)!.size === 0) {
        this.clientConnections.delete(clientId);
        this.activeRooms.delete(roomName);
      }
    }
    
    client.emit('room-left', { 
      room: roomName, 
      timestamp: Date.now() 
    });
  }

  // Método optimizado para notificaciones instantáneas
  private emitToRoom(room: string, event: string, data: any, priority: 'high' | 'normal' = 'normal') {
    const timestamp = Date.now();
    const payload = { ...data, timestamp, event };
    
    if (priority === 'high') {
      // Envío inmediato para eventos críticos
      this.server.to(room).emit(event, payload);
    } else {
      // Para eventos menos críticos, usar queue (si implementamos batching)
      this.server.to(room).emit(event, payload);
    }
  }

  // Método para notificar nuevas solicitudes a técnicos específicos (OPTIMIZADO)
  notifyNewServiceRequest(serviceRequest: ServiceRequest, technicianIds: number[]) {
    const activeRooms = technicianIds
      .map(id => `technician-${id}`)
      .filter(room => this.activeRooms.has(room));
    
    if (activeRooms.length === 0) {
      return;
    }

    const payload = {
      serviceRequest,
      message: 'Nueva solicitud de servicio disponible',
      type: 'new_request',
      priority: 'high'
    };

    // Envío paralelo a todas las salas activas
    activeRooms.forEach(room => {
      this.emitToRoom(room, 'new-service-request', payload, 'high');
    });
  }

  // Método para notificar actualización de solicitud a técnicos (OPTIMIZADO)
  notifyServiceRequestUpdate(serviceRequest: ServiceRequest, technicianIds: number[]) {
    const activeRooms = technicianIds
      .map(id => `technician-${id}`)
      .filter(room => this.activeRooms.has(room));

    const payload = {
      serviceRequest,
      message: 'Solicitud de servicio actualizada',
      type: 'request_updated'
    };

    activeRooms.forEach(room => {
      this.emitToRoom(room, 'service-request-updated', payload, 'high');
    });
  }

  // Método para notificar cuando una solicitud expira o es aceptada (OPTIMIZADO)
  notifyServiceRequestRemoved(serviceRequestId: number, technicianIds: number[]) {
    const activeRooms = technicianIds
      .map(id => `technician-${id}`)
      .filter(room => this.activeRooms.has(room));

    if (activeRooms.length === 0) {
      return;
    }

    const payload = {
      serviceRequestId,
      message: 'Solicitud de servicio ya no disponible',
      type: 'request_removed'
    };

    activeRooms.forEach(room => {
      this.emitToRoom(room, 'service-request-removed', payload, 'high');
    });
  }

  // NUEVOS MÉTODOS PARA CLIENTES (OPTIMIZADOS)

  // Notificar al cliente cuando su solicitud expira
  notifyClientRequestExpired(serviceRequest: ServiceRequest) {
    const room = `client-${serviceRequest.clientId}`;
    if (!this.activeRooms.has(room)) return;

    this.emitToRoom(room, 'service-request-expired', {
      serviceRequest,
      message: 'Tu solicitud de servicio ha expirado',
      type: 'expired'
    }, 'high');
  }

  // Notificar al cliente cuando recibe una oferta de un técnico
  notifyClientNewOffer(serviceRequest: ServiceRequest) {
    const room = `client-${serviceRequest.clientId}`;
    if (!this.activeRooms.has(room)) return;

    this.emitToRoom(room, 'service-request-offer', {
      serviceRequest,
      message: 'Has recibido una nueva oferta para tu solicitud',
      type: 'offer'
    }, 'high');
  }

  // NUEVO: Notificar al técnico cuando el cliente marca el servicio como completado
  notifyServiceCompleted(serviceRequest: ServiceRequest, technicianId: number) {
    const room = `technician-${technicianId}`;
    if (!this.activeRooms.has(room)) return;

    this.emitToRoom(room, 'service-completed', {
      serviceRequest,
      message: 'El cliente ha marcado el servicio como completado',
      type: 'completed'
    }, 'high');
  }

  // Notificar al cliente cuando un técnico acepta directamente su solicitud
  notifyClientRequestAccepted(serviceRequest: ServiceRequest) {
    const room = `client-${serviceRequest.clientId}`;
    if (!this.activeRooms.has(room)) return;

    this.emitToRoom(room, 'service-request-accepted', {
      serviceRequest,
      message: 'Un técnico ha aceptado tu solicitud de servicio',
      type: 'accepted'
    }, 'high');
  }

  // NUEVO: Notificar al cliente cuando un técnico propone una fecha alternativa
  notifyClientAlternativeDateProposal(serviceRequest: ServiceRequest, proposal: AlternativeDateProposal) {
    const room = `client-${serviceRequest.clientId}`;
    if (!this.activeRooms.has(room)) return;

    this.emitToRoom(room, 'alternative-date-proposal', {
      serviceRequest,
      proposal,
      message: `${proposal.technician.firstName} ${proposal.technician.firstLastName} ha propuesto una fecha alternativa`,
      type: 'alternative_date_proposal'
    }, 'high');
  }

  // NUEVO: Notificar al técnico cuando su propuesta de fecha alternativa es aceptada
  notifyTechnicianProposalAccepted(serviceRequest: ServiceRequest, proposal: AlternativeDateProposal) {
    const room = `technician-${proposal.technicianId}`;
    if (!this.activeRooms.has(room)) return;

    this.emitToRoom(room, 'proposal-accepted', {
      serviceRequest,
      proposal,
      message: 'El cliente ha aceptado tu propuesta de fecha alternativa',
      type: 'proposal_accepted'
    }, 'high');
  }

  // NUEVO: Notificar al técnico cuando su propuesta de fecha alternativa es rechazada
  notifyTechnicianProposalRejected(serviceRequest: ServiceRequest, proposal: AlternativeDateProposal) {
    const room = `technician-${proposal.technicianId}`;
    if (!this.activeRooms.has(room)) return;

    this.emitToRoom(room, 'proposal-rejected', {
      serviceRequest,
      proposal,
      message: 'El cliente ha rechazado tu propuesta de fecha alternativa',
      type: 'proposal_rejected'
    }, 'high');
  }

  // NUEVO: Notificar al técnico que una solicitud ya no está disponible
  notifyTechnicianRequestUnavailable(technicianId: number, serviceRequestId: number) {
    const room = `technician-${technicianId}`;
    if (!this.activeRooms.has(room)) return;

    this.emitToRoom(room, 'request-unavailable', {
      serviceRequestId,
      message: 'Esta solicitud ya no está disponible',
      type: 'request_unavailable'
    }, 'high');
  }

  // Método de utilidad para obtener estadísticas de conexiones
  getConnectionStats() {
    return {
      technicians: this.technicianConnections.size,
      clients: this.clientConnections.size,
      activeRooms: this.activeRooms.size,
      totalSockets: Array.from(this.technicianConnections.values())
        .reduce((sum, set) => sum + set.size, 0) +
        Array.from(this.clientConnections.values())
        .reduce((sum, set) => sum + set.size, 0)
    };
  }

  // Método para heartbeat personalizado y verificación de conectividad
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }
}