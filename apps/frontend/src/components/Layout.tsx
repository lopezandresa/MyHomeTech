import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'

/**
 * @fileoverview Componente de layout principal de MyHomeTech
 * 
 * @description Layout base que determina la estructura visual de la aplicación:
 * - Header condicional (no se muestra en dashboard)
 * - Outlet para renderizar las páginas
 * - Fondo adaptativo
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Componente de layout principal
 * 
 * @description Layout responsivo que adapta la UI según la ruta:
 * - Muestra header en páginas públicas (home, about, contact)
 * - Oculta header en dashboard para maximizar espacio
 * - Proporciona estructura base con fondo y altura mínima
 * 
 * @returns {JSX.Element} Layout con header condicional y outlet para páginas
 * 
 * @example
 * ```tsx
 * // Usado automáticamente en App.tsx como layout base
 * <Route path="/" element={<Layout />}>
 *   <Route index element={<HomePage />} />
 *   <Route path="/dashboard" element={<DashboardPage />} />
 * </Route>
 * ```
 */
const Layout: React.FC = () => {
  const location = useLocation()
  
  // No mostrar header en el dashboard
  const shouldShowHeader = !location.pathname.startsWith('/dashboard')

  return (
    <div className="min-h-screen bg-white">
      {shouldShowHeader && <Header />}
      <Outlet />
    </div>
  )
}

export default Layout