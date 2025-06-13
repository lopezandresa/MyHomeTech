import api from './api'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest
} from '../types/index'

// Tipos para cambio de contraseña
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

class AuthService {
  // Login
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    const token = response.data.access_token
    
    // Guardar token
    localStorage.setItem('authToken', token)
    
    // Obtener datos del usuario
    const userResponse = await api.get<User>('/identity/me')
    const user = userResponse.data
    
    // Guardar usuario
    localStorage.setItem('user', JSON.stringify(user))
    
    return { user, token }
  }

  // Registro
  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/identity/register', data)
    return response.data
  }

  // Logout
  logout(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    // Opcional: llamar al endpoint de logout del backend
    api.post('/auth/logout').catch(() => {})
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken')
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  // Obtener perfil actualizado
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/identity/me')
    const user = response.data
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }

  // Actualizar perfil
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.post<User>('/identity/me/update', data)
    const user = response.data
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }

  // Cambiar contraseña
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/identity/change-password', data)
    return response.data
  }

  // Subir foto de perfil
  async uploadProfilePhoto(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('profilePhoto', file)

    const response = await api.post<User>('/identity/me/upload-profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    const user = response.data
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }

  // Obtener URL de la foto de perfil
  getProfilePhotoUrl(profilePhotoUrl?: string): string | null {
    // Con Cloudinary, la URL ya viene completa y optimizada desde el backend
    return profilePhotoUrl || null
  }

  // Verificar rol
  hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  // Verificar si es cliente
  isClient(): boolean {
    return this.hasRole('client')
  }

  // Verificar si es técnico
  isTechnician(): boolean {
    return this.hasRole('technician')
  }

  // Verificar si es admin
  isAdmin(): boolean {
    return this.hasRole('admin')
  }
}

export const authService = new AuthService()
export default authService