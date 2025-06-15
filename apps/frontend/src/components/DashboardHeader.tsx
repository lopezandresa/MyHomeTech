import React from 'react'
import { BellIcon } from '@heroicons/react/24/outline'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle, rightContent }) => {

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* Right Side Content */}
          {rightContent ? (
            rightContent
          ) : (
            <>
              {/* Default Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
