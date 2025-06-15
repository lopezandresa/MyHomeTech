import React from 'react'
import Dashboard from '../components/dashboards/Dashboard'

/**
 * @fileoverview Página del dashboard principal de MyHomeTech
 * 
 * @description Página protegida que renderiza el dashboard principal:
 * - Punto de entrada para usuarios autenticados
 * - Adapta contenido según rol (cliente/técnico)
 * - Gestión completa de solicitudes de servicio
 * - Notificaciones en tiempo real
 * - Interfaz responsiva y moderna
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Componente de página del dashboard
 * 
 * @description Wrapper simple que renderiza el componente Dashboard principal.
 * Esta página está protegida por ProtectedRoute y requiere autenticación.
 * 
 * El dashboard se adapta automáticamente según el rol del usuario:
 * - Clientes: Gestión de solicitudes, creación de nuevas solicitudes
 * - Técnicos: Trabajos disponibles, trabajos asignados, ofertas
 * 
 * @returns {JSX.Element} Componente Dashboard renderizado
 * 
 * @example
 * ```tsx
 * // Usado en App.tsx como ruta protegida
 * <Route 
 *   path="/dashboard" 
 *   element={
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   } 
 * />
 * ```
 */
const DashboardPage: React.FC = () => {
  return <Dashboard />
}

export default DashboardPage