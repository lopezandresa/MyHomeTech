import api from './api'
import type { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UpdateProfileRequest 
} from '../types'

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
    
    // Intento automático de login tras registro exitoso
    try {
      const loginResult = await this.login({
        email: data.email,
        password: data.password
      })
      return loginResult.user
    } catch (error) {
      console.error('Error en login automático tras registro:', error)
      return response.data
    }
  }

  // Logout
  logout(): void {
    try {
      // Verificar si hay un token antes de intentar llamar al endpoint de logout
      const token = localStorage.getItem('authToken')
      if (token) {
        // Llamar al endpoint de logout del backend de forma asíncrona
        api.post('/auth/logout').catch((error) => {
          console.warn('Error en logout del backend (ignorado):', error)
        })
      }
    } catch (error) {
      console.warn('Error iniciando logout del backend:', error)
    }
    
    // Siempre limpiar localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      return false
    }

    try {
      // Verificar si el token no está expirado
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token expirado, limpiando sesión...')
        this.logout()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error verificando token:', error)
      this.logout()
      return false
    }
  }

  // Obtener perfil del usuario actual con manejo de errores mejorado
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>('/identity/me')
      const user = response.data
      
      // Actualizar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(user))
      
      return user
    } catch (error: any) {
      // Si es error 401, podría ser token expirado
      if (error.response?.status === 401) {
        console.warn('Error 401 al obtener perfil, posible token expirado')
        throw error // Dejar que el interceptor maneje el logout
      }
      
      // Para otros errores, no hacer logout automático
      console.error('Error obteniendo perfil:', error)
      throw error
    }
  }

  // Actualizar perfil con manejo de errores mejorado
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const response = await api.patch<User>('/identity/profile', data)
      const updatedUser = response.data
      
      // Actualizar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error: any) {
      console.error('Error actualizando perfil:', error)
      throw error
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Usuario no autenticado')
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error)
      throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña')
    }
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

  // Obtener usuario del localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      localStorage.removeItem('user') // Limpiar datos corruptos
      return null
    }
  }

  // Verificar si un correo ya existe
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      await api.post('/identity/check-email', { email })
      return false // Si no hay error, el correo no existe
    } catch (error: any) {
      if (error.response?.status === 409) {
        return true // Si el status es 409, el correo ya existe
      }
      throw error // Para cualquier otro error, propagar
    }
  }
}

// Crear instancia y exportar
const authService = new AuthService()

// Exportaciones nombradas y por defecto
export { authService }
export default authService