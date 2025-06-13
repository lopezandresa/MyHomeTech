import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// Configurar axios con interceptores
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token a las requests
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

// Interceptor para manejar respuestas y errores de autenticación
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

      if (isTokenExpired && !isLoginEndpoint && !isPasswordChange) {
        console.warn('Token expirado o inválido, cerrando sesión...', errorMessage)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')

        // Solo redirigir si no estamos ya en la página de login o auth
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/auth') &&
          !window.location.pathname.includes('/register')
        ) {
          // Usar un pequeño delay para evitar loops de redirección
          setTimeout(() => {
            window.location.href = '/login'
          }, 100)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api