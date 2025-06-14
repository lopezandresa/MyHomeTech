import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ClipboardDocumentListIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import DashboardHeader from '../DashboardHeader'
import UserAvatar from '../common/UserAvatar'

interface DashboardLayoutProps {
  children: React.ReactNode | ((props: { activeTab: string; setActiveTab: (tab: string) => void }) => React.ReactNode)
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  rightContent
}) => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('main')
  const navigate = useNavigate()

  // Determine menu items based on user role
  const getMenuItems = () => {
    if (!user) return []
    
    if (user.role === 'client') {
      return [
        {
          id: 'main',
          label: 'Mis Solicitudes',
          description: 'Ver mis servicios',
          icon: ClipboardDocumentListIcon
        },
        {
          id: 'profile',
          label: 'Mi Perfil',
          description: 'Configurar cuenta',
          icon: UserCircleIcon
        }
      ]
    } else if (user.role === 'technician') {
      return [
        {
          id: 'main',
          label: 'Trabajos Disponibles',
          description: 'Buscar trabajos',
          icon: WrenchScrewdriverIcon
        },
        {
          id: 'my-jobs',
          label: 'Mis Trabajos',
          description: 'Trabajos asignados',
          icon: BriefcaseIcon
        },
        {
          id: 'profile',
          label: 'Mi Perfil',
          description: 'Configurar cuenta',
          icon: UserCircleIcon
        }
      ]
    }
    return []
  }

  const menuItems = getMenuItems()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg border-r border-gray-200">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <Link 
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/MyHomeTech-Logo-1.svg" 
              alt="MyHomeTech" 
              className="h-14 w-14"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                MyHomeTech
              </h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          {user && <UserAvatar user={user} size="lg" showName={true} />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <IconComponent className={`mr-3 h-5 w-5 ${
                      activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'
                    }`} />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className={`text-xs ${
                        activeTab === item.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-colors group"
          >
            <HomeIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
            <span className="font-medium">Volver al Inicio</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader title={title} subtitle={subtitle} rightContent={rightContent} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {typeof children === 'function' 
              ? children({ activeTab, setActiveTab })
              : React.cloneElement(children as any, { activeTab, setActiveTab })
            }
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout