/**
 * @fileoverview Configuración central del cliente API para MyHomeTech Frontend
 * 
 * @description Configura la instancia de Axios con:
 * - URL base del backend
 * - Interceptores de request para autenticación JWT
 * - Interceptores de response para manejo de errores
 * - Gestión automática de tokens expirados
 * - Headers por defecto para JSON
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

import axios from 'axios'

/** URL base de la API del backend */
const API_BASE_URL = 'http://localhost:3000/api'

/**
 * Instancia configurada de Axios para comunicación con la API
 * 
 * @description Cliente HTTP centralizado con interceptores configurados para:
 * - Autenticación automática mediante JWT tokens
 * - Manejo de errores de autenticación (401)
 * - Headers JSON por defecto
 * - Limpieza automática de tokens expirados
 * 
 * @example
 * ```typescript
 * import api from './services/api';
 * 
 * // GET request
 * const response = await api.get('/service-requests');
 * 
 * // POST request con datos
 * const newRequest = await api.post('/service-requests', {
 *   applianceId: 1,
 *   description: 'Problema con lavadora'
 * });
 * ```
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Interceptor de request para autenticación automática
 * 
 * @description Agrega automáticamente el token JWT del localStorage
 * a todas las requests salientes si existe un token válido
 * 
 * @param {object} config - Configuración de la request de Axios
 * @returns {object} Configuración modificada con Authorization header
 * 
 * @example
 * ```typescript
 * // El interceptor automáticamente agrega:
 * // Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * ```
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Interceptor de response para manejo de errores de autenticación
 * 
 * @description Maneja automáticamente errores 401 (Unauthorized):
 * - Detecta tokens expirados o inválidos
 * - Limpia localStorage automáticamente
 * - Evita logout en endpoints de login/registro
 * - Preserva errores legítimos de credenciales incorrectas
 * 
 * @param {object} response - Response exitosa de Axios
 * @param {object} error - Error de response de Axios
 * @returns {Promise} Response original o error rechazado
 * 
 * @example
 * ```typescript
 * // Cuando el token expira, automáticamente:
 * // 1. Detecta error 401
 * // 2. Limpia localStorage
 * // 3. Permite que el AuthContext maneje el state
 * ```
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo hacer logout automático en casos específicos de 401
    if (error.response?.status === 401) {
      // Verificar si es un error real de token inválido vs otros errores 401
      const errorMessage = error.response?.data?.message || ''
      const isTokenExpired =
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('invalid') ||
        error.response?.statusText === 'Unauthorized'

      // También verificar que no sea un error de credenciales incorrectas en login
      const isLoginEndpoint = error.config?.url?.includes('/auth/login')
      const isPasswordChange = error.config?.url?.includes('/change-password')
      const isRegisterEndpoint = error.config?.url?.includes('/identity/register')

      // NO hacer logout ni redirección si es login, registro o cambio de contraseña
      if (isTokenExpired && !isLoginEndpoint && !isPasswordChange && !isRegisterEndpoint) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')

        // NO hacer redirección automática para evitar recargas
        // Solo limpiar el localStorage y dejar que el componente maneje el estado
      }
    }
    return Promise.reject(error)
  }
)

export default api