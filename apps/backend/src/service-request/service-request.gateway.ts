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

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class ServiceRequestGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ServiceRequestGateway.name);
  private technicianConnections = new Map<number, Set<string>>(); // technicianId -> Set of socketIds
  private clientConnections = new Map<number, Set<string>>(); // clientId -> Set of socketIds

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove client from all technician connections
    for (const [technicianId, socketIds] of this.technicianConnections.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.technicianConnections.delete(technicianId);
      }
    }

    // Remove client from all client connections
    for (const [clientId, socketIds] of this.clientConnections.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.clientConnections.delete(clientId);
      }
    }
  }

  @SubscribeMessage('join-technician-room')
  handleJoinTechnicianRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { technicianId: number }
  ) {
    const { technicianId } = data;
    
    if (!this.technicianConnections.has(technicianId)) {
      this.technicianConnections.set(technicianId, new Set());
    }
    
    this.technicianConnections.get(technicianId)!.add(client.id);
    client.join(`technician-${technicianId}`);
    
    this.logger.log(`Technician ${technicianId} joined room with socket ${client.id}`);
  }

  @SubscribeMessage('leave-technician-room')
  handleLeaveTechnicianRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { technicianId: number }
  ) {
    const { technicianId } = data;
    
    client.leave(`technician-${technicianId}`);
    
    if (this.technicianConnections.has(technicianId)) {
      this.technicianConnections.get(technicianId)!.delete(client.id);
      if (this.technicianConnections.get(technicianId)!.size === 0) {
        this.technicianConnections.delete(technicianId);
      }
    }
    
    this.logger.log(`Technician ${technicianId} left room with socket ${client.id}`);
  }

  @SubscribeMessage('join-client-room')
  handleJoinClientRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clientId: number }
  ) {
    const { clientId } = data;
    
    if (!this.clientConnections.has(clientId)) {
      this.clientConnections.set(clientId, new Set());
    }
    
    this.clientConnections.get(clientId)!.add(client.id);
    client.join(`client-${clientId}`);
    
    this.logger.log(`Client ${clientId} joined room with socket ${client.id}`);
  }

  @SubscribeMessage('leave-client-room')
  handleLeaveClientRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clientId: number }
  ) {
    const { clientId } = data;
    
    client.leave(`client-${clientId}`);
    
    if (this.clientConnections.has(clientId)) {
      this.clientConnections.get(clientId)!.delete(client.id);
      if (this.clientConnections.get(clientId)!.size === 0) {
        this.clientConnections.delete(clientId);
      }
    }
    
    this.logger.log(`Client ${clientId} left room with socket ${client.id}`);
  }

  // Método para notificar nuevas solicitudes a técnicos específicos
  notifyNewServiceRequest(serviceRequest: ServiceRequest, technicianIds: number[]) {
    technicianIds.forEach(technicianId => {
      this.server.to(`technician-${technicianId}`).emit('new-service-request', {
        serviceRequest,
        message: 'Nueva solicitud de servicio disponible'
      });
    });
    
    this.logger.log(`Notified ${technicianIds.length} technicians about new service request ${serviceRequest.id}`);
  }

  // Método para notificar actualización de solicitud a técnicos
  notifyServiceRequestUpdate(serviceRequest: ServiceRequest, technicianIds: number[]) {
    technicianIds.forEach(technicianId => {
      this.server.to(`technician-${technicianId}`).emit('service-request-updated', {
        serviceRequest,
        message: 'Solicitud de servicio actualizada'
      });
    });
  }

  // Método para notificar cuando una solicitud expira o es aceptada (técnicos)
  notifyServiceRequestRemoved(serviceRequestId: number, technicianIds: number[]) {
    technicianIds.forEach(technicianId => {
      this.server.to(`technician-${technicianId}`).emit('service-request-removed', {
        serviceRequestId,
        message: 'Solicitud de servicio ya no disponible'
      });
    });
  }

  // NUEVOS MÉTODOS PARA CLIENTES

  // Notificar al cliente cuando su solicitud expira
  notifyClientRequestExpired(serviceRequest: ServiceRequest) {
    this.server.to(`client-${serviceRequest.clientId}`).emit('service-request-expired', {
      serviceRequest,
      message: 'Tu solicitud de servicio ha expirado',
      type: 'expired'
    });
    
    this.logger.log(`Notified client ${serviceRequest.clientId} about expired request ${serviceRequest.id}`);
  }

  // Notificar al cliente cuando recibe una oferta de un técnico
  notifyClientNewOffer(serviceRequest: ServiceRequest) {
    this.server.to(`client-${serviceRequest.clientId}`).emit('service-request-offer', {
      serviceRequest,
      message: 'Has recibido una nueva oferta para tu solicitud',
      type: 'offer'
    });
    
    this.logger.log(`Notified client ${serviceRequest.clientId} about new offer for request ${serviceRequest.id}`);
  }

  // Notificar al cliente cuando un técnico acepta directamente su solicitud
  notifyClientRequestAccepted(serviceRequest: ServiceRequest) {
    this.server.to(`client-${serviceRequest.clientId}`).emit('service-request-accepted', {
      serviceRequest,
      message: 'Un técnico ha aceptado tu solicitud de servicio',
      type: 'accepted'
    });
    
    this.logger.log(`Notified client ${serviceRequest.clientId} about accepted request ${serviceRequest.id}`);
  }

  // Notificar al cliente sobre actualizaciones en el estado de su solicitud
  notifyClientRequestUpdate(serviceRequest: ServiceRequest, message: string, type: string) {
    this.server.to(`client-${serviceRequest.clientId}`).emit('service-request-update', {
      serviceRequest,
      message,
      type
    });
    
    this.logger.log(`Notified client ${serviceRequest.clientId} about request update ${serviceRequest.id}: ${type}`);
  }

  // Notificar al técnico cuando el cliente rechaza su oferta
  notifyOfferRejected(serviceRequest: ServiceRequest, technicianId: number) {
    this.server.to(`technician-${technicianId}`).emit('offer-rejected', {
      serviceRequest,
      message: 'El cliente ha rechazado tu oferta',
      type: 'rejected'
    });
    
    this.logger.log(`Notified technician ${technicianId} about rejected offer for request ${serviceRequest.id}`);
  }
}