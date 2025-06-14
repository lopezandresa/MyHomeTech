import React from 'react'
import { motion } from 'framer-motion'
import { dashboardStyles, dashboardAnimations } from '../../utils/dashboardStyles'

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
}

interface DashboardTabsProps {
  title: string
  subtitle: string
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  children: React.ReactNode
  error?: string | null
  success?: string | null
  isLoading?: boolean
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
  error,
  success,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className={dashboardStyles.container}>
        <div className={dashboardStyles.loading.container}>
          <div className={dashboardStyles.loading.content}>
            <div className={dashboardStyles.loading.spinner}></div>
            <p className={dashboardStyles.loading.text}>Cargando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={dashboardStyles.container}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={dashboardStyles.header.title}>{title}</h1>
        <p className={dashboardStyles.header.subtitle}>{subtitle}</p>
      </div>

      {/* Main Card */}
      <div className={dashboardStyles.card}>
        {/* Tabs Navigation */}
        <div className={dashboardStyles.tabContainer}>
          <nav className={dashboardStyles.tabNav} aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={dashboardStyles.tabButton(activeTab === tab.id)}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.subtitle && activeTab !== tab.id && (
                      <span className="text-xs text-gray-400">({tab.subtitle})</span>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className={dashboardStyles.tabContent}>
          {/* Global Alerts */}
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

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardTabs
