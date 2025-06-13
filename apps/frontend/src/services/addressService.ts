import api from './api'
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '../types/index'

class AddressService {
  // Obtener todas las direcciones del usuario
  async getMyAddresses(): Promise<Address[]> {
    const response = await api.get<Address[]>('/addresses')
    return response.data
  }

  // Obtener dirección principal del usuario
  async getPrimaryAddress(): Promise<Address | null> {
    try {
      const response = await api.get<Address>('/addresses/primary')
      return response.data
    } catch (error) {
      return null
    }
  }

  // Obtener una dirección específica
  async getAddressById(id: number): Promise<Address> {
    const response = await api.get<Address>(`/addresses/${id}`)
    return response.data
  }

  // Crear nueva dirección
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await api.post<Address>('/addresses', data)
    return response.data
  }

  // Actualizar dirección
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<Address> {
    const response = await api.patch<Address>(`/addresses/${id}`, data)
    return response.data
  }

  // Establecer dirección como principal
  async setPrimaryAddress(id: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/addresses/${id}/set-primary`)
    return response.data
  }

  // Eliminar dirección
  async deleteAddress(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/addresses/${id}`)
    return response.data
  }
}

export const addressService = new AddressService()
export default addressService