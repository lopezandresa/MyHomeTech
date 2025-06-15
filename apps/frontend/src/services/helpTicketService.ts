import axios from 'axios';
import type { 
  HelpTicket, 
  CreateHelpTicketRequest, 
  RespondHelpTicketRequest, 
  HelpTicketStats,
  HelpTicketStatus,
  HelpTicketType 
} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

// Configurar axios con interceptor para incluir token de autorización
const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Servicio para manejar operaciones de tickets de ayuda
 */
export const helpTicketService = {
  /**
   * Crear un nuevo ticket de ayuda
   */
  async createTicket(ticketData: CreateHelpTicketRequest): Promise<HelpTicket> {
    const response = await api.post('/help-tickets', ticketData);
    return response.data;
  },

  /**
   * Obtener todos los tickets del usuario autenticado
   */
  async getMyTickets(): Promise<HelpTicket[]> {
    const response = await api.get('/help-tickets/my-tickets');
    return response.data;
  },

  /**
   * Obtener un ticket específico por ID
   */
  async getTicketById(ticketId: number): Promise<HelpTicket> {
    const response = await api.get(`/help-tickets/${ticketId}`);
    return response.data;
  },

  /**
   * Obtener todos los tickets para administradores
   */
  async getAllTickets(filters?: {
    status?: HelpTicketStatus;
    type?: HelpTicketType;
  }): Promise<HelpTicket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const response = await api.get(`/help-tickets/admin/all?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de tickets para administradores
   */
  async getTicketStats(): Promise<HelpTicketStats> {
    const response = await api.get('/help-tickets/admin/stats');
    return response.data;
  },

  /**
   * Responder a un ticket (solo administradores)
   */
  async respondToTicket(ticketId: number, response: RespondHelpTicketRequest): Promise<HelpTicket> {
    const apiResponse = await api.patch(`/help-tickets/${ticketId}/respond`, response);
    return apiResponse.data;
  },

  /**
   * Asignar ticket a un administrador (solo administradores)
   */
  async assignTicket(ticketId: number, assignedAdminId: number): Promise<HelpTicket> {
    const response = await api.patch(`/help-tickets/${ticketId}/assign`, {
      assignedAdminId
    });
    return response.data;
  },

  /**
   * Actualizar estado de un ticket (solo administradores)
   */
  async updateTicketStatus(ticketId: number, status: string): Promise<HelpTicket> {
    const response = await api.patch(`/help-tickets/${ticketId}/status`, {
      status
    });
    return response.data;
  },

  /**
   * Agregar respuesta de administrador a un ticket
   */
  async addAdminResponse(ticketId: number, message: string): Promise<HelpTicket> {
    const response = await api.post(`/help-tickets/${ticketId}/admin-response`, {
      message
    });
    return response.data;
  },

  /**
   * Obtener un ticket específico (alias para getTicketById)
   */
  async getTicket(ticketId: number): Promise<HelpTicket> {
    return this.getTicketById(ticketId);
  }
};

/**
 * Utilidades para tickets de ayuda
 */
export const helpTicketUtils = {
  /**
   * Obtener el color de badge según el estado del ticket
   */
  getStatusBadgeColor(status: HelpTicketStatus): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Obtener el color de badge según el tipo de ticket
   */
  getTypeBadgeColor(type: HelpTicketType): string {
    switch (type) {
      case 'cancel_service':
        return 'bg-red-100 text-red-800';
      case 'reschedule_service':
        return 'bg-orange-100 text-orange-800';
      case 'technical_issue':
        return 'bg-purple-100 text-purple-800';
      case 'payment_issue':
        return 'bg-yellow-100 text-yellow-800';
      case 'general_inquiry':
        return 'bg-blue-100 text-blue-800';
      case 'complaint':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Obtener el color de badge según la prioridad
   */
  getPriorityBadgeColor(priority: string): string {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Obtener texto legible para el estado
   */
  getStatusText(status: HelpTicketStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_review':
        return 'En Revisión';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'resolved':
        return 'Resuelto';
      default:
        return status;
    }
  },

  /**
   * Obtener texto legible para el tipo
   */
  getTypeText(type: HelpTicketType): string {
    switch (type) {
      case 'cancel_service':
        return 'Cancelar Servicio';
      case 'reschedule_service':
        return 'Reagendar Servicio';
      case 'technical_issue':
        return 'Problema Técnico';
      case 'general_inquiry':
        return 'Consulta General';
      case 'complaint':
        return 'Queja';
      default:
        return type;
    }
  },

  /**
   * Obtener texto legible para la prioridad
   */
  getPriorityText(priority: string): string {
    switch (priority) {
      case 'low':
        return 'Baja';
      case 'medium':
        return 'Media';
      case 'high':
        return 'Alta';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  },

  /**
   * Formatear fecha para mostrar en la UI
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Obtener tiempo relativo (ej: "hace 2 horas")
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    } else {
      return this.formatDate(dateString);
    }
  }
};