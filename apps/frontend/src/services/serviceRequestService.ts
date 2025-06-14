import api from './api'
import type {
  ServiceRequest,
  CreateServiceRequestRequest,
  AvailabilityCheckResponse,
  CalendarEvent,
  AlternativeDateProposal
} from '../types/index'

class ServiceRequestService {
  // Cliente crea solicitud con fecha propuesta
  async createRequest(data: CreateServiceRequestRequest): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>('/service-requests', data)
    return response.data
  }

  // Técnico ve solicitudes pendientes (todas)
  async getPendingRequests(): Promise<ServiceRequest[]> {
    const response = await api.get<ServiceRequest[]>('/service-requests/pending')
    return response.data
  }

  // Técnico ve solicitudes disponibles para él (filtradas por especialidad y disponibilidad)
  async getAvailableRequestsForMe(): Promise<ServiceRequest[]> {
    const response = await api.get<ServiceRequest[]>('/service-requests/available-for-me')
    return response.data
  }

  // Técnico acepta una solicitud directamente
  async acceptRequest(id: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/accept`)
    return response.data
  }

  // Cliente completa servicio
  async completeRequest(id: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/complete`)
    return response.data
  }

  // Cliente cancela solicitud
  async cancelRequest(id: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/cancel`)
    return response.data
  }

  // Obtener solicitud por ID
  async getRequestById(id: number): Promise<ServiceRequest> {
    const response = await api.get<ServiceRequest>(`/service-requests/${id}`)
    return response.data
  }

  // Cliente ve sus solicitudes
  async getClientRequests(clientId: number): Promise<ServiceRequest[]> {
    const response = await api.get<ServiceRequest[]>(`/service-requests/client/${clientId}`)
    return response.data
  }

  // Cliente obtiene sus solicitudes con ofertas y propuestas
  async getMyRequestsWithOffers(): Promise<ServiceRequest[]> {
    const response = await api.get<ServiceRequest[]>('/service-requests/my-requests')
    return response.data
  }

  // Técnico ve sus solicitudes asignadas
  async getTechnicianRequests(technicianId: number): Promise<ServiceRequest[]> {
    const response = await api.get<ServiceRequest[]>(`/service-requests/technician/${technicianId}`)
    return response.data
  }

  // Obtener calendario de técnico
  async getTechnicianCalendar(technicianId: number, startDate?: Date, endDate?: Date): Promise<ServiceRequest[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())
    
    const response = await api.get<ServiceRequest[]>(`/service-requests/calendar/technician/${technicianId}?${params}`)
    return response.data
  }

  // Obtener calendario de cliente
  async getClientCalendar(clientId: number, startDate?: Date, endDate?: Date): Promise<ServiceRequest[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())
    
    const response = await api.get<ServiceRequest[]>(`/service-requests/calendar/client/${clientId}?${params}`)
    return response.data
  }

  // Verificar disponibilidad de técnico
  async checkTechnicianAvailability(dateTime: Date): Promise<AvailabilityCheckResponse> {
    const response = await api.get<AvailabilityCheckResponse>(
      `/service-requests/availability/check?dateTime=${dateTime.toISOString()}`
    )
    return response.data
  }

  // Convertir solicitudes a eventos de calendario
  convertToCalendarEvents(requests: ServiceRequest[]): CalendarEvent[] {
    return requests.map(request => ({
      id: request.id,
      title: `${request.appliance.name} - ${request.client.firstName} ${request.client.firstLastName}`,
      start: request.scheduledAt || request.proposedDateTime,
      end: this.calculateEndTime(request.scheduledAt || request.proposedDateTime),
      serviceRequest: request
    }))
  }

  // Calcular hora de fin (6 horas después)
  private calculateEndTime(startTime: string): string {
    const start = new Date(startTime)
    const end = new Date(start.getTime() + 6 * 60 * 60 * 1000) // 6 horas
    return end.toISOString()
  }

  // Validar horario de trabajo (6 AM - 6 PM)
  validateWorkingHours(dateTime: Date): { valid: boolean; message?: string } {
    const hours = dateTime.getHours()
    
    if (hours < 6) {
      return { valid: false, message: 'El horario de servicio inicia a las 6:00 AM' }
    }
    
    if (hours >= 18) {
      return { valid: false, message: 'El horario de servicio termina a las 6:00 PM' }
    }
    
    return { valid: true }
  }

  // Validar que la fecha sea futura
  validateFutureDate(dateTime: Date): { valid: boolean; message?: string } {
    if (dateTime <= new Date()) {
      return { valid: false, message: 'La fecha debe ser futura' }
    }
      return { valid: true }
  }

  // Proponer fecha alternativa (técnico)
  async proposeAlternativeDate(requestId: number, alternativeDateTime: string, comment?: string): Promise<AlternativeDateProposal> {
    const response = await api.post<AlternativeDateProposal>(`/service-requests/${requestId}/propose-alternative-date`, {
      alternativeDateTime,
      comment
    })
    return response.data
  }

  // Cliente acepta propuesta de fecha alternativa
  async acceptAlternativeDateProposal(proposalId: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/proposals/${proposalId}/accept`)
    return response.data
  }

  // Cliente rechaza propuesta de fecha alternativa
  async rejectAlternativeDateProposal(proposalId: number): Promise<AlternativeDateProposal> {
    const response = await api.post<AlternativeDateProposal>(`/service-requests/proposals/${proposalId}/reject`)
    return response.data
  }

  // Obtener propuestas de fechas alternativas para una solicitud
  async getAlternativeDateProposals(requestId: number): Promise<AlternativeDateProposal[]> {
    const response = await api.get<AlternativeDateProposal[]>(`/service-requests/${requestId}/alternative-date-proposals`)
    return response.data
  }

  // Técnico obtiene sus propuestas de fechas alternativas
  async getTechnicianAlternativeDateProposals(): Promise<AlternativeDateProposal[]> {
    const response = await api.get<AlternativeDateProposal[]>('/service-requests/technician/alternative-date-proposals')
    return response.data
  }

  // Enviar calificación del servicio
  async submitRating(requestId: number, rating: number, comment: string): Promise<void> {
    const response = await api.post(`/service-requests/${requestId}/rating`, {
      rating,
      comment
    })
    return response.data
  }
}

export const serviceRequestService = new ServiceRequestService()
export default serviceRequestService