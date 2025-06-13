import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import serviceRequestService from '../../services/serviceRequestService'
import type { ServiceRequest } from '../../types/index'

interface MyRequestsProps {
  activeTab?: string
}

const MyRequests: React.FC<MyRequestsProps> = ({ activeTab }) => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'in-progress' | 'all'>('in-progress')

  useEffect(() => {
    if (activeTab === 'main' && user?.role === 'client') {
      fetchRequests()
    }
  }, [activeTab, user])

  useEffect(() => {
    applyFilter()
  }, [requests, filter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      if (user?.id) {
        const data = await serviceRequestService.getClientRequests(user.id)
        setRequests(data)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = () => {
    if (filter === 'in-progress') {
      const inProgressStatuses = ['pending', 'offered', 'accepted', 'scheduled', 'in_progress']
      setFilteredRequests(requests.filter(req => inProgressStatuses.includes(req.status)))
    } else {
      setFilteredRequests(requests)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      offered: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      scheduled: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: 'Pendiente',
      offered: 'Oferta Recibida',
      accepted: 'Aceptada',
      scheduled: 'Programada',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    }
    return statusTexts[status as keyof typeof statusTexts] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (activeTab !== 'main' || user?.role !== 'client') {
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Solicitudes</h1>
        <p className="text-gray-600">Gestiona tus solicitudes de servicio técnico</p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setFilter('in-progress')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'in-progress'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          En Curso ({requests.filter(r => ['pending', 'offered', 'accepted', 'scheduled', 'in_progress'].includes(r.status)).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todas ({requests.length})
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'in-progress' ? 'No tienes solicitudes en curso' : 'No tienes solicitudes'}
          </h3>
          <p className="text-gray-600">
            {filter === 'in-progress' 
              ? 'Todas tus solicitudes han sido completadas o canceladas'
              : 'Crea tu primera solicitud de servicio técnico'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.appliance.name} - {request.appliance.brand}
                  </h3>
                  <p className="text-sm text-gray-600">Modelo: {request.appliance.model}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{request.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tu Precio</p>
                  <p className="text-lg font-semibold text-green-600">${request.clientPrice.toLocaleString()}</p>
                </div>
                {request.technicianPrice && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Precio Técnico</p>
                    <p className="text-lg font-semibold text-blue-600">${request.technicianPrice.toLocaleString()}</p>
                  </div>
                )}
                {request.technician && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Técnico Asignado</p>
                    <p className="text-sm text-gray-900">{request.technician.firstName} {request.technician.firstLastName}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Creada: {formatDate(request.createdAt)}</span>
                {request.scheduledAt && (
                  <span>Programada: {formatDate(request.scheduledAt)}</span>
                )}
                {request.completedAt && (
                  <span>Completada: {formatDate(request.completedAt)}</span>
                )}
              </div>

              {request.status === 'offered' && (
                <div className="mt-4 flex space-x-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Aceptar Oferta
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyRequests