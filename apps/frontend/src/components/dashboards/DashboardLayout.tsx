import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('main')

  const getMenuItems = () => {
    if (user?.role === 'client') {
      return [
        { id: 'main', label: 'Mis Solicitudes', icon: '📋' },
        { id: 'create-request', label: 'Nueva Solicitud', icon: '➕' },
        { id: 'profile', label: 'Mi Perfil', icon: '👤' }
      ]
    } else if (user?.role === 'technician') {
      return [
        { id: 'main', label: 'Trabajos Disponibles', icon: '🔧' },
        { id: 'my-jobs', label: 'Mis Trabajos', icon: '📋' },
        { id: 'profile', label: 'Mi Perfil', icon: '👤' }
      ]
    }
    return []
  }

  const menuItems = getMenuItems()

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">My Home Tech</h1>
          <p className="text-sm text-gray-600 mt-1">
            Bienvenido, {user?.name}
          </p>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-2">
            {user?.role === 'client' ? 'Cliente' : 'Técnico'}
          </span>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="mr-3">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {React.cloneElement(children as any, { activeTab })}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout