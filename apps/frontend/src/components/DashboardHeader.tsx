import React from 'react'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuth()

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
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role === 'client' ? 'Cliente' : 'Técnico'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
