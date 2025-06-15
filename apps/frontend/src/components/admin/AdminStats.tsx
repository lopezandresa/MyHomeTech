import React from 'react'
import { type AdminStats as AdminStatsType } from '../../types'
import AdminStatsCard from './AdminStatsCard'
import { 
  FiUsers, 
  FiTool, 
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus
} from 'react-icons/fi'

interface AdminStatsProps {
  stats: AdminStatsType
  loading: boolean
}

/**
 * Componente que muestra las estadísticas principales del sistema MyHomeTech
 * Enfocado en métricas operativas sin componentes financieros
 */
const AdminStats: React.FC<AdminStatsProps> = ({ stats, loading }) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <FiTrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <FiTrendingDown className="w-4 h-4 text-red-500" />
      case 'stable':
        return <FiMinus className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'stable':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="mt-4">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminStatsCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
          trend="up"
          trendValue={5.2}
        />
        <AdminStatsCard
          title="Técnicos Activos"
          value={stats.totalTechnicians}
          icon={<FiTool className="w-6 h-6" />}
          color="green"
          trend="up"
          trendValue={2.1}
        />
        <AdminStatsCard
          title="Servicios Completados"
          value={stats.completedRequests}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="purple"
          trend="up"
          trendValue={8.3}
        />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de usuarios por rol */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Usuarios
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Clientes</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalUsers > 0 ? (stats.totalClients / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.totalClients}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Técnicos</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalUsers > 0 ? (stats.totalTechnicians / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.totalTechnicians}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Administradores</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalUsers > 0 ? (stats.totalAdmins / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.totalAdmins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de actividad */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad del Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiUsers className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Usuarios Activos</span>
              </div>
              <span className="text-lg font-semibold text-green-600">{stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiClock className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Solicitudes Pendientes</span>
              </div>
              <span className="text-lg font-semibold text-yellow-600">{stats.pendingRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Total Solicitudes</span>
              </div>
              <span className="text-lg font-semibold text-blue-600">{stats.totalServiceRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiTrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm text-gray-600">Calificación Promedio</span>
              </div>
              <span className="text-lg font-semibold text-purple-600">{stats.averageRating.toFixed(1)}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminStats