import api from './api'
import type {
  TechnicianProfile,
  CreateTechnicianProfileRequest,
  Appliance,
  ApplianceType
} from '../types/index'

class TechnicianService {
  // Crear perfil de técnico con archivo
  async createProfile(data: CreateTechnicianProfileRequest): Promise<TechnicianProfile> {
    const formData = new FormData()
    formData.append('identityId', data.identityId.toString())
    formData.append('cedula', data.cedula)
    formData.append('birthDate', data.birthDate)
    formData.append('experienceYears', data.experienceYears.toString())
    formData.append('specialties', JSON.stringify(data.specialties))
      if (data.idPhotoFile) {
      formData.append('idPhoto', data.idPhotoFile)
    }

    const response = await api.post<TechnicianProfile>('/technicians/create-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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

  // Obtener mi perfil de técnico
  async getMyProfile(): Promise<TechnicianProfile> {
    const response = await api.get<TechnicianProfile>('/technicians/me')
    return response.data
  }

  // Actualizar mi perfil de técnico con archivo opcional
  async updateMyProfile(data: Partial<CreateTechnicianProfileRequest>): Promise<TechnicianProfile> {
    const formData = new FormData()
    
    if (data.cedula) formData.append('cedula', data.cedula)
    if (data.birthDate) formData.append('birthDate', data.birthDate)
    if (data.experienceYears !== undefined) formData.append('experienceYears', data.experienceYears.toString())
    if (data.specialties) formData.append('specialties', JSON.stringify(data.specialties))
    if (data.idPhotoFile) formData.append('idPhoto', data.idPhotoFile)

    const response = await api.put<TechnicianProfile>('/technicians/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Agregar especialidad
  async addSpecialty(specialtyId: number): Promise<TechnicianProfile> {
    const response = await api.post<TechnicianProfile>(`/technicians/me/specialties/${specialtyId}`)
    return response.data
  }

  // Remover especialidad
  async removeSpecialty(specialtyId: number): Promise<TechnicianProfile> {
    const response = await api.delete<TechnicianProfile>(`/technicians/me/specialties/${specialtyId}`)
    return response.data
  }

  // Obtener tipos de electrodomésticos disponibles
  async getApplianceTypes(): Promise<ApplianceType[]> {
    const response = await api.get<ApplianceType[]>('/appliance-types')
    return response.data
  }

  // Obtener todos los electrodomésticos disponibles (legacy)
  async getAppliances(): Promise<Appliance[]> {
    const response = await api.get<Appliance[]>('/appliances')
    return response.data
  }

  // Buscar electrodomésticos por nombre
  async searchAppliances(name: string): Promise<Appliance[]> {
    const response = await api.get<Appliance[]>(`/appliances/search?name=${encodeURIComponent(name)}`)
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