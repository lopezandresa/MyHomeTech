import React, { useState } from 'react'
import { FiStar, FiTrendingUp, FiTrendingDown, FiUser, FiPhone, FiMail, FiTool } from 'react-icons/fi'

interface TechnicianPerformance {
  id: number
  name: string
  email: string
  phone?: string
  profilePhoto?: string
  specialties: string[]
  totalServices: number
  completedServices: number
  averageRating: number
  responseTime: number // en horas
  completionRate: number // porcentaje
  isActive: boolean
}

interface TechnicianPerformanceTableProps {
  technicians: TechnicianPerformance[]
  loading?: boolean
}

/**
 * Componente de tabla para mostrar el rendimiento de técnicos de MyHomeTech
 * Incluye métricas de servicios completados, calificaciones y ingresos generados
 */
const TechnicianPerformanceTable: React.FC<TechnicianPerformanceTableProps> = ({ 
  technicians, 
  loading = false 
}) => {
  const [sortBy, setSortBy] = useState<'rating' | 'services' | 'completion'>('services')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Función para ordenar técnicos
  const sortedTechnicians = [...technicians].sort((a, b) => {
    let aValue: number, bValue: number

    switch (sortBy) {
      case 'rating':
        aValue = a.averageRating
        bValue = b.averageRating
        break
      case 'services':
        aValue = a.completedServices
        bValue = b.completedServices
        break
      case 'completion':
        aValue = a.completionRate
        bValue = b.completionRate
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  // Renderizar estrellas de calificación
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="h-4 w-4 text-yellow-400 fill-current" />)
    }

    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />)
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  // Obtener color del badge de rendimiento
  const getPerformanceBadge = (rate: number) => {
    if (rate >= 90) return 'bg-green-100 text-green-800'
    if (rate >= 75) return 'bg-yellow-100 text-yellow-800'
    if (rate >= 60) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  // Formatear moneda colombiana
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Rendimiento de Técnicos</h3>
        <p className="text-sm text-gray-500">Métricas de servicios y calificaciones • MyHomeTech</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Técnico
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center">
                  Calificación
                  {sortBy === 'rating' && (
                    sortOrder === 'desc' ? <FiTrendingDown className="ml-1 h-4 w-4" /> : <FiTrendingUp className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('services')}
              >
                <div className="flex items-center">
                  Servicios
                  {sortBy === 'services' && (
                    sortOrder === 'desc' ? <FiTrendingDown className="ml-1 h-4 w-4" /> : <FiTrendingUp className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('completion')}
              >
                <div className="flex items-center">
                  Rendimiento
                  {sortBy === 'completion' && (
                    sortOrder === 'desc' ? <FiTrendingDown className="ml-1 h-4 w-4" /> : <FiTrendingUp className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTechnicians.map((technician) => (
              <tr key={technician.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {technician.profilePhoto ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={technician.profilePhoto}
                          alt={technician.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <FiUser className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{technician.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiMail className="h-3 w-3 mr-1" />
                        {technician.email}
                      </div>
                      {technician.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiPhone className="h-3 w-3 mr-1" />
                          {technician.phone}
                        </div>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {technician.specialties.slice(0, 2).map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <FiTool className="h-3 w-3 mr-1" />
                            {specialty}
                          </span>
                        ))}
                        {technician.specialties.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{technician.specialties.length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(technician.averageRating)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {technician.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Basado en servicios completados
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="font-semibold text-green-600">{technician.completedServices}</span> completados
                  </div>
                  <div className="text-sm text-gray-500">
                    de {technician.totalServices} totales
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${technician.completionRate}%` }}
                    ></div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceBadge(technician.completionRate)}`}>
                    {technician.completionRate.toFixed(1)}%
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    Respuesta: {technician.responseTime.toFixed(1)}h
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    technician.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {technician.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen de estadísticas */}
      {sortedTechnicians.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {sortedTechnicians.filter(t => t.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Técnicos Activos</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {(sortedTechnicians.reduce((sum, t) => sum + t.averageRating, 0) / sortedTechnicians.length).toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">Calificación Promedio</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {sortedTechnicians.reduce((sum, t) => sum + t.completedServices, 0)}
              </p>
              <p className="text-sm text-gray-500">Servicios Completados</p>
            </div>
          </div>
        </div>
      )}

      {sortedTechnicians.length === 0 && (
        <div className="px-6 py-12 text-center">
          <FiUser className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay técnicos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Los técnicos aparecerán aquí cuando se registren en la plataforma.
          </p>
        </div>
      )}
    </div>
  )
}

export default TechnicianPerformanceTable