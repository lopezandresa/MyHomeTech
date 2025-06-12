import api from './api'
import type {
  ClientProfile,
  CreateClientProfileRequest
} from '../types/index'

class ClientService {
  // Crear perfil de cliente
  async createProfile(data: CreateClientProfileRequest): Promise<ClientProfile> {
    const response = await api.post<ClientProfile>('/clients/profile', data)
    return response.data
  }

  // Obtener todos los clientes (admin)
  async getAllClients(): Promise<ClientProfile[]> {
    const response = await api.get<ClientProfile[]>('/clients')
    return response.data
  }
  // Obtener cliente por ID
  async getClientById(id: number): Promise<ClientProfile> {
    const response = await api.get<ClientProfile>(`/clients/${id}`)
    return response.data
  }

  // Obtener mi perfil de cliente
  async getMyProfile(): Promise<ClientProfile> {
    const response = await api.get<ClientProfile>('/clients/me')
    return response.data
  }

  // Actualizar mi perfil de cliente
  async updateMyProfile(data: Partial<CreateClientProfileRequest>): Promise<ClientProfile> {
    const response = await api.put<ClientProfile>('/clients/me', data)
    return response.data
  }
}

export const clientService = new ClientService()
export default clientService