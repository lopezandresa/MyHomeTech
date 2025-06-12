import React, { useState } from 'react'
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import DashboardHeader from '../DashboardHeader'

interface DashboardLayoutProps {
  children: React.ReactNode | ((props: { activeTab: string; setActiveTab: (tab: string) => void }) => React.ReactNode)
  title: string
  subtitle?: string
  onNavigate?: (page: string) => void
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  onNavigate 
}) => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('main')
  const getMenuItems = () => {
    if (user?.role === 'client') {
      return [
        { 
          id: 'main', 
          label: 'Mis Solicitudes', 
          icon: ClipboardDocumentListIcon,
          description: 'Ver todas mis solicitudes'
        },
        { 
          id: 'create-request', 
          label: 'Nueva Solicitud', 
          icon: PlusIcon,
          description: 'Crear solicitud de servicio'
        },
        { 
          id: 'profile', 
          label: 'Mi Perfil', 
          icon: UserCircleIcon,
          description: 'Configurar mi perfil'
        }
      ]
    } else if (user?.role === 'technician') {
      return [
        { 
          id: 'main', 
          label: 'Trabajos Disponibles', 
          icon: WrenchScrewdriverIcon,
          description: 'Ver trabajos disponibles'
        },
        { 
          id: 'my-jobs', 
          label: 'Mis Trabajos', 
          icon: BriefcaseIcon,
          description: 'Mis trabajos asignados'
        },
        { 
          id: 'profile', 
          label: 'Mi Perfil', 
          icon: UserCircleIcon,
          description: 'Configurar mi perfil'
        }
      ]
    }
    return []
  }

  const menuItems = getMenuItems()

  const handleLogout = () => {
    logout()
    onNavigate?.('home')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg border-r border-gray-200">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <button 
            onClick={() => onNavigate?.('home')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">HT</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                HomeTech
              </h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.role === 'client' ? 'Cliente' : 'Técnico'}
              </span>
            </div>
          </div>
        </div>        {/* Navigation */}
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
          <button
            onClick={() => onNavigate?.('home')}
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-colors group"
          >
            <HomeIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
            <span className="font-medium">Volver al Inicio</span>
          </button>
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
        <DashboardHeader title={title} subtitle={subtitle} />        <main className="flex-1 p-6">
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