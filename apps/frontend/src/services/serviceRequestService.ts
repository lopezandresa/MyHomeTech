import api from './api'
import type {
  ServiceRequest,
  CreateServiceRequestRequest,
  OfferPriceRequest,
  AcceptRequestRequest,
  ScheduleRequestRequest
} from '../types/index'

class ServiceRequestService {
  // Cliente crea solicitud
  async createRequest(data: CreateServiceRequestRequest): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>('/service-requests', data)
    return response.data
  }

  // Técnico ve solicitudes pendientes
  async getPendingRequests(): Promise<ServiceRequest[]> {
    const response = await api.get<ServiceRequest[]>('/service-requests/pending')
    return response.data
  }

  // Técnico ve solicitudes pendientes filtradas por sus especialidades
  async getPendingRequestsForMe(): Promise<ServiceRequest[]> {
    const response = await api.get<ServiceRequest[]>('/service-requests/pending/for-me')
    return response.data
  }

  // Técnico hace contraoferta
  async offerPrice(id: number, data: OfferPriceRequest): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/offer`, data)
    return response.data
  }

  // Cliente acepta solicitud/precio
  async acceptRequest(id: number, data: AcceptRequestRequest): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/accept`, data)
    return response.data
  }

  // Técnico agenda solicitud
  async scheduleRequest(id: number, data: ScheduleRequestRequest): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/schedule`, data)
    return response.data
  }

  // Técnico acepta y agenda directamente
  async acceptAndSchedule(id: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/accept-and-schedule`)
    return response.data
  }

  // Cliente completa servicio
  async completeRequest(id: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/complete`)
    return response.data
  }

  // Cliente rechaza oferta de técnico
  async rejectOffer(id: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/reject-offer`)
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

  // Técnico ve sus solicitudes asignadas
  async getTechnicianRequests(technicianId: number): Promise<ServiceRequest[]> {
    const response = await api.get<ServiceRequest[]>(`/service-requests/technician/${technicianId}`)
    return response.data
  }

  // Cliente acepta oferta específica
  async acceptSpecificOffer(serviceRequestId: number, offerId: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${serviceRequestId}/accept-offer/${offerId}`)
    return response.data
  }

  // Cliente cancela toda la solicitud
  async cancelRequest(id: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/cancel`)
    return response.data
  }

  // Cliente hace contraoferta
  async clientCounterOffer(id: number, data: OfferPriceRequest): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/client-counter-offer`, data)
    return response.data
  }

  // Cliente actualiza precio inicial de su solicitud
  async updateClientPrice(id: number, newPrice: number): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(`/service-requests/${id}/update-price`, { price: newPrice })
    return response.data
  }
}

export const serviceRequestService = new ServiceRequestService()
export default serviceRequestService