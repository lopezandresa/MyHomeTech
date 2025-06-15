import React from 'react'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface AdminStatsCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  trend?: 'up' | 'down'
  trendValue?: number
}

/**
 * Componente de tarjeta para mostrar estadísticas en el panel de administrador
 */
const AdminStatsCard: React.FC<AdminStatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  trendValue 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    purple: 'bg-purple-500 text-purple-100',
    orange: 'bg-orange-500 text-orange-100',
    red: 'bg-red-500 text-red-100',
    yellow: 'bg-yellow-500 text-yellow-100'
  }

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50'
  }

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return val.toLocaleString()
    }
    return val
  }

  return (
    <div className={`${bgColorClasses[color]} p-6 rounded-lg border border-gray-200 shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${colorClasses[color]} p-3 rounded-full`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          </div>
        </div>
        
        {trend && trendValue && (
          <div className={`flex items-center text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? (
              <FiTrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <FiTrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">{trendValue}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminStatsCard
export { AdminStatsCard }