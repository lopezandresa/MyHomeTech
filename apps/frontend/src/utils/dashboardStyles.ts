/**
 * @fileoverview Utilidades de estilos para componentes del dashboard
 * 
 * @description Proporciona estilos consistentes y reutilizables para:
 * - Componentes de dashboard (cards, tabs, formularios)
 * - Estados de alerta y notificaciones
 * - Animaciones y transiciones
 * - Botones y elementos interactivos
 * - Sistema de colores y tipografía
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

/**
 * Clases de estilos organizadas por categorías para dashboard
 * 
 * @description Objeto con estilos predefinidos siguiendo principios DRY:
 * - Consistencia visual en toda la aplicación
 * - Facilita mantenimiento y actualizaciones
 * - Reduce duplicación de código CSS
 * - Mejora la experiencia de desarrollo
 * 
 * @example
 * ```tsx
 * import { dashboardStyles } from './dashboardStyles'
 * 
 * // Usar estilos predefinidos
 * <div className={dashboardStyles.card}>
 *   <h2 className={dashboardStyles.header.title}>Mi Título</h2>
 *   <button className={dashboardStyles.button.primary}>Acción</button>
 * </div>
 * ```
 */
export const dashboardStyles = {
  // Container styles
  container: 'p-6 max-w-4xl mx-auto',
  
  // Header styles
  header: {
    title: 'text-2xl font-bold text-gray-900',
    subtitle: 'text-gray-600'
  },
  
  // Card styles
  card: 'bg-white rounded-lg shadow-lg',
  cardHeader: 'flex items-center justify-between mb-6',
  
  // Tab styles
  tabContainer: 'border-b border-gray-200',
  tabNav: 'flex space-x-8 px-6',
  /**
   * Genera clases de estilo para botones de tabs
   * @param {boolean} isActive - Si el tab está activo
   * @returns {string} Clases CSS para el tab
   */
  tabButton: (isActive: boolean) => 
    `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`,
  tabContent: 'p-6',
  
  // Section styles
  section: {
    header: 'flex items-center justify-between mb-6',
    title: 'flex items-center space-x-3',
    titleIcon: 'h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center',
    titleText: 'text-lg font-semibold text-gray-900',
    subtitle: 'text-sm text-gray-600'
  },
  
  // Form styles
  form: {
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    field: 'space-y-2',
    label: 'flex items-center space-x-2 text-sm font-medium text-gray-700',
    input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    textarea: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none',
    select: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    actions: 'flex justify-end space-x-4 pt-6'
  },
  
  // Button styles
  button: {
    primary: 'flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
    secondary: 'flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors',
    edit: 'flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors',
    danger: 'flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors',
    small: 'flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm'
  },
  
  // Alert styles
  alert: {
    error: 'mb-6 p-4 bg-red-50 border border-red-200 rounded-lg',
    success: 'mb-6 p-4 bg-green-50 border border-green-200 rounded-lg',
    warning: 'mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg',
    info: 'mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'
  },
  
  // Text styles
  text: {
    error: 'text-red-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
    muted: 'text-gray-600',
    small: 'text-sm',
    xs: 'text-xs'
  },
  
  // Loading styles
  loading: {
    container: 'flex items-center justify-center py-20',
    content: 'text-center',
    spinner: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4',
    text: 'text-gray-600'
  },
  
  // Modal styles
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    container: 'bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto',
    header: 'flex justify-between items-center mb-6',
    title: 'text-xl font-semibold text-gray-900',
    closeButton: 'text-gray-400 hover:text-gray-600 transition-colors'
  }
}

/**
 * Configuraciones de animaciones para componentes del dashboard
 * 
 * @description Animaciones predefinidas usando Framer Motion:
 * - Entradas suaves y profesionales
 * - Transiciones consistentes
 * - Mejora la experiencia de usuario
 * - Feedback visual para interacciones
 * 
 * @example
 * ```tsx
 * import { dashboardAnimations } from './dashboardStyles'
 * 
 * // Aplicar animación de entrada
 * <motion.div {...dashboardAnimations.slideUp}>
 *   Contenido animado
 * </motion.div>
 * ```
 */
export const dashboardAnimations = {
  /**
   * Animación de deslizamiento hacia arriba con fade
   */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  
  /**
   * Animación de fade simple
   */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  /**
   * Animación para modales y overlays
   */
  modal: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 }
  },
  
  /**
   * Animación para elementos que aparecen desde la izquierda
   */
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  }
}

/**
 * Funciones utilitarias comunes para estilos del dashboard
 * 
 * @description Métodos para obtener clases de estilo según tipo y estado:
 * - Botones, alertas y texto con semántica clara
 * - Facilita la consistencia en el uso de estilos
 * - Reduce la necesidad de recordar cadenas de clases CSS
 * 
 * @example
 * ```tsx
 * import { getDashboardClasses } from './dashboardStyles'
 * 
 * // Usar clase de botón primaria
 * <button className={getDashboardClasses.buttonByType('primary')}>Guardar</button>
 * ```
 */
export const getDashboardClasses = {
  /**
   * Obtiene clases para botones de tab
   * @param {boolean} isActive - Si el tab está activo
   * @returns {string} Clases CSS para el tab
   */
  tabButton: (isActive: boolean) => dashboardStyles.tabButton(isActive),
  
  /**
   * Obtiene clases de alerta según tipo
   * @param {'error' | 'success' | 'warning' | 'info'} type - Tipo de alerta
   * @returns {string} Clases CSS para la alerta
   */
  alertByType: (type: 'error' | 'success' | 'warning' | 'info') => 
    dashboardStyles.alert[type],
    
  /**
   * Obtiene clases de texto según tipo
   * @param {'error' | 'success' | 'warning' | 'info' | 'muted' | 'small' | 'xs'} type - Tipo de texto
   * @returns {string} Clases CSS para el texto
   */
  textByType: (type: 'error' | 'success' | 'warning' | 'info' | 'muted' | 'small' | 'xs') => 
    dashboardStyles.text[type],
    
  /**
   * Obtiene clases para botones según tipo
   * @param {'primary' | 'secondary' | 'edit' | 'danger' | 'small'} type - Tipo de botón
   * @returns {string} Clases CSS para el botón
   */
  buttonByType: (type: 'primary' | 'secondary' | 'edit' | 'danger' | 'small') => 
    dashboardStyles.button[type]
}
