import React from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

/**
 * @fileoverview Página principal de MyHomeTech
 * 
 * @description Página de aterrizaje que presenta los servicios de MyHomeTech:
 * - Sección hero con llamada a la acción
 * - Información sobre la empresa
 * - Formulario de contacto
 * - Footer con enlaces adicionales
 * - Optimizada para conversión y SEO
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Componente de página principal (HomePage)
 * 
 * @description Página de aterrizaje completa que combina múltiples secciones:
 * - Hero: Presentación principal con CTAs
 * - About: Información de la empresa y beneficios
 * - Contact: Formulario para solicitar información
 * - Footer: Links legales y redes sociales
 * 
 * Esta página se muestra solo a usuarios no autenticados.
 * Los usuarios autenticados son redirigidos automáticamente al dashboard.
 * 
 * @returns {JSX.Element} Página principal completa
 * 
 * @example
 * ```tsx
 * // Usado en App.tsx como página por defecto
 * <Route 
 *   index 
 *   element={
 *     <RedirectIfAuthenticated>
 *       <HomePage />
 *     </RedirectIfAuthenticated>
 *   } 
 * />
 * ```
 */
const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <About />
      <Contact />
      <Footer />
    </>
  )
}

export default HomePage