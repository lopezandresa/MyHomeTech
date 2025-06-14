import React from 'react'
import { motion } from 'framer-motion'
import { PencilIcon } from '@heroicons/react/24/outline'
import { dashboardStyles, dashboardAnimations } from '../../utils/dashboardStyles'

interface DashboardSectionProps {
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  isEditing?: boolean
  canEdit?: boolean
  onEdit?: () => void
  children: React.ReactNode
  error?: string | null
  success?: string | null
  actions?: React.ReactNode
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  icon: IconComponent,
  isEditing = false,
  canEdit = false,
  onEdit,
  children,
  error,
  success,
  actions
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className={dashboardStyles.section.header}>
        <div className={dashboardStyles.section.title}>
          <div className={dashboardStyles.section.titleIcon}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className={dashboardStyles.section.titleText}>{title}</h2>
            {subtitle && (
              <p className={dashboardStyles.section.subtitle}>{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {actions}
          {canEdit && !isEditing && onEdit && (
            <button
              onClick={onEdit}
              className={dashboardStyles.button.edit}
            >
              <PencilIcon className="h-4 w-4" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* Section Alerts */}
      {error && (
        <motion.div
          {...dashboardAnimations.fadeIn}
          className={dashboardStyles.alert.error}
        >
          <p className={dashboardStyles.text.error}>{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          {...dashboardAnimations.fadeIn}
          className={dashboardStyles.alert.success}
        >
          <p className={dashboardStyles.text.success}>{success}</p>
        </motion.div>
      )}

      {/* Section Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default DashboardSection
