import React from 'react'
import { motion } from 'framer-motion'
import { dashboardAnimations } from '../../utils/dashboardStyles'

interface DashboardPanelProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

/**
 * Componente simple para paneles de dashboard sin iconos grandes
 * Usado para listas de trabajos, solicitudes, etc.
 */
const DashboardPanel: React.FC<DashboardPanelProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {  return (
    <motion.div
      {...dashboardAnimations.slideUp}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header simple */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <span className="text-sm text-gray-600">{subtitle}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  )
}

export default DashboardPanel
