import api from './api'
import type {
  TechnicianProfile,
  CreateTechnicianProfileRequest,
  Appliance
} from '../types/index'

class TechnicianService {
  // Crear perfil de técnico
  async createProfile(data: CreateTechnicianProfileRequest): Promise<TechnicianProfile> {
    const response = await api.post<TechnicianProfile>('/technicians/profile', data)
    return response.data
  }

  // Obtener todos los técnicos
  async getAllTechnicians(): Promise<TechnicianProfile[]> {
    const response = await api.get<TechnicianProfile[]>('/technicians')
    return response.data
  }

  // Obtener técnico por ID
  async getTechnicianById(id: number): Promise<TechnicianProfile> {
    const response = await api.get<TechnicianProfile>(`/technicians/${id}`)
    return response.data
  }

  // Obtener todos los electrodomésticos disponibles
  async getAppliances(): Promise<Appliance[]> {
    const response = await api.get<Appliance[]>('/appliances')
    return response.data
  }

  // Buscar electrodomésticos por nombre
  async searchAppliances(name: string): Promise<Appliance[]> {
    const response = await api.get<Appliance[]>(`/appliances/search/${name}`)
    return response.data
  }

  // Obtener electrodoméstico por ID
  async getApplianceById(id: number): Promise<Appliance> {
    const response = await api.get<Appliance>(`/appliances/${id}`)
    return response.data
  }
}

export const technicianService = new TechnicianService()
export default technicianService