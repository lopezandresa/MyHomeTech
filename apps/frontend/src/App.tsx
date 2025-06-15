import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/common/ToastProvider'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

/**
 * @fileoverview Componente principal de la aplicación MyHomeTech Frontend
 * 
 * @description Configura la estructura principal de la aplicación incluyendo:
 * - Sistema de rutas con React Router
 * - Contextos globales (Auth, Toast)
 * - Protección de rutas según autenticación
 * - Layout responsivo
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Componente raíz de la aplicación MyHomeTech
 * 
 * @description Configura la estructura completa de la aplicación con:
 * - Router para navegación SPA
 * - AuthProvider para gestión de autenticación global
 * - ToastProvider para notificaciones toast
 * - Sistema de rutas protegidas y públicas
 * - Redirecciones automáticas según estado de autenticación
 * 
 * @returns {JSX.Element} Árbol de componentes de la aplicación
 * 
 * @example
 * ```tsx
 * // La aplicación se renderiza automáticamente desde main.tsx
 * // Estructura de rutas:
 * // / - Página principal (redirige a /dashboard si está autenticado)
 * // /dashboard - Dashboard principal (protegida)
 * // /profile - Perfil de usuario (protegida)
 * // /settings - Configuración (protegida)
 * ```
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Ruta pública que redirige si está autenticado */}
              <Route 
                index 
                element={
                  <RedirectIfAuthenticated>
                    <HomePage />
                  </RedirectIfAuthenticated>
                } 
              />
              
              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Ruta catch-all para redireccionar a home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
