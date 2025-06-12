import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import DashboardLayout from './DashboardLayout'
import MyRequests from './MyRequests'
import AvailableJobs from './AvailableJobs'

interface DashboardProps {
  activeTab: string
}

const DashboardContent: React.FC<DashboardProps> = ({ activeTab }) => {
  const { user } = useAuth()

  // Client Dashboard Content
  if (user?.role === 'client') {
    switch (activeTab) {
      case 'main':
        return <MyRequests activeTab={activeTab} />
      case 'create-request':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nueva Solicitud</h1>
            <p className="text-gray-600 mb-6">Crea una nueva solicitud de servicio técnico</p>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-500">Formulario de nueva solicitud - En desarrollo</p>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
            <p className="text-gray-600 mb-6">Gestiona tu información personal</p>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <p className="text-lg text-gray-900">Cliente</p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <MyRequests activeTab={activeTab} />
    }
  }

  // Technician Dashboard Content
  if (user?.role === 'technician') {
    switch (activeTab) {
      case 'main':
        return <AvailableJobs activeTab={activeTab} />
      case 'my-jobs':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Trabajos</h1>
            <p className="text-gray-600 mb-6">Gestiona tus trabajos asignados y completados</p>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-500">Lista de trabajos asignados - En desarrollo</p>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
            <p className="text-gray-600 mb-6">Gestiona tu información profesional</p>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <p className="text-lg text-gray-900">Técnico</p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <AvailableJobs activeTab={activeTab} />
    }
  }

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso no autorizado</h2>
      <p className="text-gray-600">No tienes permisos para acceder a este dashboard</p>
    </div>
  )
}

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardContent activeTab="main" />
    </DashboardLayout>
  )
}

export default Dashboard