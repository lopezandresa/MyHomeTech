import api from './api'
import type { 
  AdminUserManagement, 
  CreateAdminUserRequest, 
  AdminStats, 
  UserFilters,
  User,
  ChangePasswordRequest,
  ServiceRequest
} from '../types'

/**
 * Servicio para gestión administrativa de MyHomeTech
 * Maneja todas las operaciones de administrador incluyendo:
 * - Gestión de usuarios (clientes, técnicos, administradores)
 * - Estadísticas del sistema de solicitudes de servicio
 * - Rendimiento de técnicos
 */
class AdminService {
  private readonly baseURL = '/identity'
  private readonly serviceRequestURL = '/service-requests'

  /**
   * Obtiene todos los usuarios del sistema
   */
  async getAllUsers(): Promise<AdminUserManagement[]> {
    const response = await api.get(this.baseURL)
    return response.data
  }

  /**
   * Obtiene un usuario específico por ID
   */
  async getUserById(id: number): Promise<AdminUserManagement> {
    const response = await api.get(`${this.baseURL}/${id}`)
    return response.data
  }

  /**
   * Activa o desactiva un usuario
   */
  async toggleUserStatus(id: number): Promise<AdminUserManagement> {
    const response = await api.post(`${this.baseURL}/${id}/toggle-status`)
    return response.data
  }

  /**
   * Crea un nuevo usuario administrador
   */
  async createAdminUser(userData: CreateAdminUserRequest): Promise<AdminUserManagement> {
    const response = await api.post(`${this.baseURL}/register`, userData)
    return response.data
  }

  /**
   * Obtiene estadísticas generales del sistema basadas en datos reales
   */
  async getSystemStats(): Promise<AdminStats> {
    try {
      // Obtener todos los usuarios
      const users = await this.getAllUsers()
      
      // Obtener todas las solicitudes de servicio para estadísticas
      const allServiceRequests = await this.getAllServiceRequests()
      
      // Calcular estadísticas de usuarios
      const totalUsers = users.length
      const totalClients = users.filter(u => u.role === 'client').length
      const totalTechnicians = users.filter(u => u.role === 'technician').length
      const totalAdmins = users.filter(u => u.role === 'admin').length
      const activeUsers = users.filter(u => u.status === true).length
      const inactiveUsers = users.filter(u => u.status === false).length

      // Calcular estadísticas de solicitudes de servicio
      const totalServiceRequests = allServiceRequests.length
      const pendingRequests = allServiceRequests.filter(sr => sr.status === 'pending').length
      const completedRequests = allServiceRequests.filter(sr => sr.status === 'completed').length

      const stats: AdminStats = {
        totalUsers,
        totalClients,
        totalTechnicians,
        totalAdmins,
        activeUsers,
        inactiveUsers,
        totalServiceRequests,
        pendingRequests,
        completedRequests,
        averageRating: 4.5 // Valor simulado, se necesitaría endpoint específico
      }

      return stats
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las solicitudes de servicio para análisis administrativo
   */
  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const response = await api.get(`${this.serviceRequestURL}/all`)
      return response.data
    } catch (error) {
      console.error('Error al obtener solicitudes de servicio:', error)
      return []
    }
  }

  /**
   * Obtiene estadísticas de solicitudes de servicio por mes
   */
  async getServiceRequestStats(): Promise<{
    monthly: Array<{
      month: string
      pending: number
      scheduled: number
      completed: number
      cancelled: number
    }>
    totals: {
      pending: number
      scheduled: number
      completed: number
      cancelled: number
    }
  }> {
    try {
      const requests = await this.getAllServiceRequests()
      
      // Agrupar por mes (últimos 12 meses)
      const monthlyStats = this.groupRequestsByMonth(requests)
      
      // Calcular totales
      const totals = {
        pending: requests.filter(r => r.status === 'pending').length,
        scheduled: requests.filter(r => r.status === 'scheduled').length,
        completed: requests.filter(r => r.status === 'completed').length,
        cancelled: requests.filter(r => r.status === 'cancelled').length
      }

      return { monthly: monthlyStats, totals }
    } catch (error) {
      console.error('Error al obtener estadísticas de solicitudes:', error)
      return { monthly: [], totals: { pending: 0, scheduled: 0, completed: 0, cancelled: 0 } }
    }
  }

  /**
   * Obtiene rendimiento de técnicos
   */
  async getTechnicianPerformance(): Promise<Array<{
    id: number
    name: string
    email: string
    specialties: string[]
    totalServices: number
    completedServices: number
    averageRating: number
    responseTime: number
    completionRate: number
    isActive: boolean
  }>> {
    try {
      const users = await this.getAllUsers()
      const technicians = users.filter(u => u.role === 'technician')
      const requests = await this.getAllServiceRequests()

      return technicians.map(tech => {
        const techRequests = requests.filter(r => r.technicianId === tech.id)
        const completedServices = techRequests.filter(r => r.status === 'completed').length
        const totalServices = techRequests.length

        return {
          id: tech.id,
          name: `${tech.firstName} ${tech.firstLastName}`,
          email: tech.email,
          specialties: ['Refrigeración', 'Lavadoras'], // Se necesitaría endpoint específico
          totalServices,
          completedServices,
          averageRating: 4.2 + Math.random() * 0.8, // Simulado
          responseTime: 2 + Math.random() * 4, // Horas
          completionRate: totalServices > 0 ? (completedServices / totalServices) * 100 : 0,
          isActive: tech.status
        }
      })
    } catch (error) {
      console.error('Error al obtener rendimiento de técnicos:', error)
      return []
    }
  }

  /**
   * Filtra usuarios según criterios específicos
   */
  async getFilteredUsers(filters: UserFilters): Promise<AdminUserManagement[]> {
    const users = await this.getAllUsers()
    
    return users.filter(user => {
      // Filtro por rol
      if (filters.role && filters.role !== 'all' && user.role !== filters.role) {
        return false
      }
      
      // Filtro por estado
      if (filters.status && filters.status !== 'all') {
        const isActive = filters.status === 'active'
        if (user.status !== isActive) {
          return false
        }
      }
      
      // Filtro por búsqueda (nombre o email)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const fullName = `${user.firstName} ${user.firstLastName}`.toLowerCase()
        const email = user.email.toLowerCase()
        
        if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
          return false
        }
      }
      
      return true
    })
  }

  /**
   * Métodos auxiliares para agrupación de datos
   */
  private groupRequestsByMonth(requests: ServiceRequest[]) {
    const months = this.getLast12Months()
    
    return months.map(month => {
      const monthRequests = requests.filter(r => {
        const requestDate = new Date(r.createdAt)
        return requestDate.getFullYear() === month.year && requestDate.getMonth() === month.month
      })

      return {
        month: month.name,
        pending: monthRequests.filter(r => r.status === 'pending').length,
        scheduled: monthRequests.filter(r => r.status === 'scheduled').length,
        completed: monthRequests.filter(r => r.status === 'completed').length,
        cancelled: monthRequests.filter(r => r.status === 'cancelled').length
      }
    })
  }

  private getLast12Months() {
    const months = []
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        name: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        month: date.getMonth(),
        year: date.getFullYear()
      })
    }
    
    return months
  }

  /**
   * Métodos heredados para compatibilidad
   */
  async updateAdminProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put(`${this.baseURL}/profile`, userData)
    return response.data
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.put(`${this.baseURL}/change-password`, passwordData)
    return response.data
  }

  async uploadProfilePhoto(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`${this.baseURL}/upload-profile-photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await api.get(`${this.baseURL}/check-email/${email}`)
      return response.data.available
    } catch (error) {
      console.error('Error al verificar disponibilidad de email:', error)
      return false
    }
  }

  /**
   * Obtiene solicitudes por estado específico
   */
  async getServiceRequestsByStatus(status: string): Promise<ServiceRequest[]> {
    try {
      const allRequests = await this.getAllServiceRequests()
      return allRequests.filter(request => request.status === status)
    } catch (error) {
      console.error('Error al obtener solicitudes por estado:', error)
      return []
    }
  }

  /**
   * Obtiene solo clientes del sistema
   */
  async getClients(): Promise<AdminUserManagement[]> {
    const users = await this.getAllUsers()
    return users.filter(user => user.role === 'client')
  }

  /**
   * Obtiene solo técnicos del sistema
   */
  async getTechnicians(): Promise<AdminUserManagement[]> {
    const users = await this.getAllUsers()
    return users.filter(user => user.role === 'technician')
  }

  /**
   * Obtiene solo administradores del sistema
   */
  async getAdmins(): Promise<AdminUserManagement[]> {
    const users = await this.getAllUsers()
    return users.filter(user => user.role === 'admin')
  }

  /**
   * Actualiza información de un usuario específico
   */
  async updateUser(userId: number, userData: {
    firstName?: string
    middleName?: string | null
    firstLastName?: string
    secondLastName?: string | null
  }): Promise<AdminUserManagement> {
    const response = await api.patch(`${this.baseURL}/${userId}`, userData)
    return response.data
  }  /**
   * Crea un nuevo administrador
   */
  async createAdmin(adminData: any): Promise<AdminUserManagement> {
    const response = await api.post(`${this.baseURL}/admin`, adminData)
    return response.data
  }

  /**
   * Cancela una solicitud de servicio
   */
  async cancelServiceRequest(requestId: number, reason: string): Promise<void> {
    await api.patch(`${this.serviceRequestURL}/${requestId}/cancel`, { reason })
  }
}

export const adminService = new AdminService()