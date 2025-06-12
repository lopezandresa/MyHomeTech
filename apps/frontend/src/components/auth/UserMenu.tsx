import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

interface UserMenuProps {
  onNavigate?: (page: string) => void
}

const UserMenu: React.FC<UserMenuProps> = ({ onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!isAuthenticated || !user) return null

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    // Redirect to home
    if (onNavigate) {
      onNavigate('home')
    }
  }

  const handleNavigation = (page: string) => {
    setIsOpen(false)
    if (onNavigate) {
      onNavigate(page)
    }
  }

  const menuItems = [
    {
      icon: UserIcon,
      label: 'Mi Perfil',
      action: () => handleNavigation('profile')
    },
    {
      icon: user.role === 'client' ? ClipboardDocumentListIcon : WrenchScrewdriverIcon,
      label: user.role === 'client' ? 'Mis Solicitudes' : 'Mis Servicios',
      action: () => handleNavigation('dashboard')
    },
    {
      icon: Cog6ToothIcon,
      label: 'Configuración',
      action: () => handleNavigation('settings')
    },
    {
      icon: ArrowRightOnRectangleIcon,
      label: 'Cerrar Sesión',
      action: handleLogout,
      className: 'text-red-600 hover:text-red-700'
    }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full py-2 px-4 hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-gray-700 font-medium hidden sm:block">
          {user.name}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  user.role === 'client' 
                    ? 'bg-blue-100 text-blue-800' 
                    : user.role === 'technician'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {user.role === 'client' ? 'Cliente' : user.role === 'technician' ? 'Técnico' : 'Admin'}
                </span>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${item.className || ''}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu