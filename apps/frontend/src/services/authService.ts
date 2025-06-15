/**
 * @fileoverview Servicio de autenticación para MyHomeTech Frontend
 * 
 * @description Maneja todas las operaciones de autenticación y gestión de usuarios:
 * - Login y registro de usuarios
 * - Gestión de tokens JWT y localStorage
 * - Verificación de autenticación y roles
 * - Actualización de perfiles y cambio de contraseñas
 * - Subida de fotos de perfil
 * - Validación de emails existentes
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

import api from './api'
import type { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfileRequest 
} from '../types'

/**
 * Servicio centralizado de autenticación
 * 
 * @description Clase que encapsula toda la lógica de autenticación:
 * - Comunicación con API de autenticación
 * - Gestión de estado de sesión en localStorage
 * - Validación de tokens JWT
 * - Operaciones de perfil de usuario
 * 
 * @example
 * ```typescript
 * import { authService } from './services/authService';
 * 
 * // Login
 * const { user, token } = await authService.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * 
 * // Verificar autenticación
 * if (authService.isAuthenticated()) {
 *   const user = authService.getCurrentUser();
 * }
 * ```
 */
class AuthService {
  /**
   * Autentica un usuario con email y contraseña
   * 
   * @description Realiza login del usuario y guarda el token y datos del usuario
   * en localStorage. Obtiene el perfil completo después del login exitoso.
   * 
   * @param {LoginRequest} data - Credenciales de login
   * @returns {Promise<{user: User; token: string}>} Usuario autenticado y token JWT
   * @throws {Error} Si las credenciales son incorrectas o hay error del servidor
   * 
   * @example
   * ```typescript
   * try {
   *   const result = await authService.login({
   *     email: 'cliente@example.com',
   *     password: 'miPassword123'
   *   });
   *   console.log('Usuario logueado:', result.user.firstName);
   * } catch (error) {
   *   console.error('Error en login:', error.message);
   * }
   * ```
   */
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', data)
    
    // Verificar si hay error en la respuesta
    if (response.data.hasError) {
      // Lanzar error con el mensaje específico del backend
      throw new Error(response.data.message || 'Error en el inicio de sesión')
    }
    
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
  /**
   * Registra un nuevo usuario en el sistema
   * 
   * @description Crea una cuenta nueva e intenta hacer login automático.
   * Si el login automático falla, retorna solo los datos del usuario creado.
   * 
   * @param {RegisterRequest} data - Datos de registro del usuario
   * @returns {Promise<User>} Usuario registrado
   * @throws {Error} Si el email ya existe o datos inválidos
   * 
   * @example
   * ```typescript
   * const newUser = await authService.register({
   *   firstName: 'Juan',
   *   firstLastName: 'Pérez',
   *   email: 'juan@example.com',
   *   password: 'password123',
   *   role: 'client'
   * });
   * ```
   */
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
      //console.error('Error en login automático tras registro:', error)
      return response.data
    }
  }

  /**
   * Cierra la sesión del usuario
   * 
   * @description Limpia el localStorage y opcionalmente notifica al backend.
   * Si hay error en el backend, solo limpia el estado local.
   * 
   * @example
   * ```typescript
   * authService.logout();
   * // El usuario queda desautenticado localmente
   * ```
   */
  logout(): void {
    try {
      // Verificar si hay un token antes de intentar llamar al endpoint de logout
      const token = localStorage.getItem('authToken')
      if (token) {
        // Llamar al endpoint de logout del backend de forma asíncrona
        api.post('/auth/logout').catch(() => {
          //console.warn('Error en logout del backend (ignorado):', error)
        })
      }
    } catch (error) {
      //console.warn('Error iniciando logout del backend:', error)
    }
    
    // Siempre limpiar localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  /**
   * Verifica si el usuario está autenticado
   * 
   * @description Comprueba la existencia y validez del token JWT:
   * - Verifica existencia de token y usuario en localStorage
   * - Decodifica y valida la expiración del token
   * - Limpia la sesión si el token está expirado
   * 
   * @returns {boolean} true si está autenticado y el token es válido
   * 
   * @example
   * ```typescript
   * if (authService.isAuthenticated()) {
   *   // Usuario autenticado, mostrar contenido protegido
   * } else {
   *   // Redirigir a login
   * }
   * ```
   */
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
        //console.warn('Token expirado, limpiando sesión...')
        this.logout()
        return false
      }
      
      return true
    } catch (error) {
      //console.error('Error verificando token:', error)
      this.logout()
      return false
    }
  }

  /**
   * Obtiene el perfil del usuario actual desde el servidor
   * 
   * @description Refresca los datos del usuario desde la API y actualiza localStorage.
   * Maneja errores 401 para tokens expirados.
   * 
   * @returns {Promise<User>} Datos actualizados del usuario
   * @throws {Error} Si no está autenticado o hay error del servidor
   * 
   * @example
   * ```typescript
   * try {
   *   const currentUser = await authService.getProfile();
   *   console.log('Perfil actualizado:', currentUser.email);
   * } catch (error) {
   *   // Manejar error o token expirado
   * }
   * ```
   */
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
        //console.warn('Error 401 al obtener perfil, posible token expirado')
        throw error // Dejar que el interceptor maneje el logout
      }
      
      // Para otros errores, no hacer logout automático
      //console.error('Error obteniendo perfil:', error)
      throw error
    }
  }

  /**
   * Actualiza el perfil del usuario autenticado
   * 
   * @description Envía datos actualizados al servidor y sincroniza localStorage
   * 
   * @param {UpdateProfileRequest} data - Datos a actualizar
   * @returns {Promise<User>} Usuario con datos actualizados
   * @throws {Error} Si falla la actualización
   * 
   * @example
   * ```typescript
   * const updatedUser = await authService.updateProfile({
   *   firstName: 'Juan Carlos',
   *   phone: '+57 300 123 4567'
   * });
   * ```
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const response = await api.patch<User>('/identity/profile', data)
      const updatedUser = response.data
      
      // Actualizar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error: any) {
      //console.error('Error actualizando perfil:', error)
      throw error
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * 
   * @description Valida la contraseña actual y establece una nueva
   * 
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @throws {Error} Si la contraseña actual es incorrecta o hay error del servidor
   * 
   * @example
   * ```typescript
   * await authService.changePassword('oldPass123', 'newPass456');
   * ```
   */
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
      //console.error('Error cambiando contraseña:', error)
      throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña')
    }
  }

  /**
   * Sube una foto de perfil para el usuario
   * 
   * @description Envía archivo de imagen al servidor mediante FormData
   * y actualiza los datos del usuario con la nueva URL de la foto
   * 
   * @param {File} file - Archivo de imagen a subir
   * @returns {Promise<User>} Usuario actualizado con nueva foto
   * @throws {Error} Si falla la subida o el archivo no es válido
   * 
   * @example
   * ```typescript
   * const fileInput = document.getElementById('photo-input') as HTMLInputElement;
   * const file = fileInput.files[0];
   * const updatedUser = await authService.uploadProfilePhoto(file);
   * ```
   */
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

  /**
   * Obtiene la URL de la foto de perfil del usuario
   * 
   * @description Retorna la URL completa de Cloudinary o null si no hay foto
   * 
   * @param {string} profilePhotoUrl - URL de la foto de perfil (opcional)
   * @returns {string | null} URL de la foto o null
   * 
   * @example
   * ```typescript
   * const photoUrl = authService.getProfilePhotoUrl(user.profilePhotoUrl);
   * if (photoUrl) {
   *   <img src={photoUrl} alt="Foto de perfil" />
   * }
   * ```
   */
  getProfilePhotoUrl(profilePhotoUrl?: string): string | null {
    // Con Cloudinary, la URL ya viene completa y optimizada desde el backend
    return profilePhotoUrl || null
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * 
   * @param {string} role - Rol a verificar ('client', 'technician', 'admin')
   * @returns {boolean} true si el usuario tiene el rol especificado
   * 
   * @example
   * ```typescript
   * if (authService.hasRole('admin')) {
   *   // Mostrar panel de administración
   * }
   * ```
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  /**
   * Verifica si el usuario es cliente
   * @returns {boolean} true si es cliente
   */
  isClient(): boolean {
    return this.hasRole('client')
  }

  /**
   * Verifica si el usuario es técnico
   * @returns {boolean} true si es técnico
   */
  isTechnician(): boolean {
    return this.hasRole('technician')
  }

  /**
   * Verifica si el usuario es administrador
   * @returns {boolean} true si es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('admin')
  }

  /**
   * Obtiene el usuario actual del localStorage
   * 
   * @description Parsea y retorna los datos del usuario guardados localmente.
   * Limpia datos corruptos automáticamente.
   * 
   * @returns {User | null} Usuario actual o null si no hay sesión
   * 
   * @example
   * ```typescript
   * const user = authService.getCurrentUser();
   * if (user) {
   *   console.log(`Bienvenido ${user.firstName}`);
   * }
   * ```
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      //console.error('Error parsing user from localStorage:', error)
      localStorage.removeItem('user') // Limpiar datos corruptos
      return null
    }
  }

  /**
   * Verifica si un email ya existe en el sistema
   * 
   * @description Consulta al backend para validar disponibilidad del email
   * antes del registro
   * 
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>} true si el email ya existe
   * 
   * @example
   * ```typescript
   * const emailExists = await authService.checkEmailExists('test@example.com');
   * if (emailExists) {
   *   // Mostrar mensaje de email ya registrado
   * }
   * ```
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      await api.post('/identity/check-email', { email })
      return false // Si no hay error, el correo no existe
    } catch (error: any) {
      if (error.response?.status === 409) {
        return true // Si el status es 409, el correo ya existe
      }
      return false // Si es otro error, asumir que el correo no existe
      //throw error // Para cualquier otro error, propagar
    }
  }
}

/**
 * Instancia singleton del servicio de autenticación
 * 
 * @description Instancia única del AuthService para usar en toda la aplicación
 * 
 * @example
 * ```typescript
 * import { authService } from './services/authService';
 * // o
 * import authService from './services/authService';
 * ```
 */
const authService = new AuthService()

export { authService }
export default authService