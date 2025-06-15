import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Prevenir errores no manejados que causen recarga de página
window.addEventListener('error', (event) => {
  event.preventDefault()
  return false
})

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault()
  return false
})

/**
 * @fileoverview Punto de entrada principal de la aplicación MyHomeTech Frontend
 * 
 * @description Este archivo inicializa la aplicación React con configuraciones:
 * - StrictMode para desarrollo con verificaciones adicionales
 * - Renderizado en el elemento DOM root
 * - Importación de estilos globales
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Inicializa y renderiza la aplicación React principal
 * 
 * @description Crea el root de React y renderiza el componente App
 * dentro de StrictMode para obtener verificaciones adicionales
 * durante el desarrollo
 * 
 * @example
 * ```typescript
 * // La aplicación se monta automáticamente en el elemento #root del DOM
 * // Configurado en index.html
 * ```
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
