import api from './api'

export interface ServiceRequestType {
  id: number
  name: string
  displayName: string
  description?: string
  icon?: string
  isActive: boolean
  sortOrder: number
}

export const serviceRequestTypeService = {
  async getAll(): Promise<ServiceRequestType[]> {
    const response = await api.get<ServiceRequestType[]>('/service-request-types')
    return response.data
  }
}