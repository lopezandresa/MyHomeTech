/**
 * Utility functions for consistent dashboard styling across components
 * Implements DRY principle for dashboard panels and UI elements
 */

// Common style classes for dashboard components
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
    textarea: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical',
    select: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    checkbox: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
    fileInput: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    required: 'text-red-500'
  },
  
  // Button styles
  button: {
    primary: 'flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50',
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
    container: 'bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto'
  },
  
  // Status styles for specialties, addresses, etc.
  status: {
    item: 'flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg',
    checkIcon: 'h-4 w-4 text-blue-600 mr-3',
    removeButton: 'text-red-600 hover:text-red-700 p-1'
  }
}

// Animation variants for Framer Motion
export const dashboardAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.1 }
  },
  modal: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }
}

// Common utility functions for dashboard styling
export const getDashboardClasses = {
  tabButton: (isActive: boolean) => dashboardStyles.tabButton(isActive),
  
  alertByType: (type: 'error' | 'success' | 'warning' | 'info') => 
    dashboardStyles.alert[type],
    
  textByType: (type: 'error' | 'success' | 'warning' | 'info' | 'muted' | 'small' | 'xs') => 
    dashboardStyles.text[type],
    
  buttonByType: (type: 'primary' | 'secondary' | 'edit' | 'danger' | 'small') => 
    dashboardStyles.button[type]
}
