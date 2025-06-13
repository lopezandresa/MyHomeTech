import React, { useState, useEffect } from 'react'
import { serviceRequestService } from '../../services/serviceRequestService'
import type { ServiceRequest } from '../../types/index'
import { formatDate } from '../../utils/dateUtils'
import { useAuth } from '../../contexts/AuthContext'

interface AvailableJobsProps {
  activeTab?: string
}

const AvailableJobs: React.FC<AvailableJobsProps> = ({ activeTab }) => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    if (activeTab === 'main' && user?.role === 'technician') {
      fetchPendingRequests()
    }
  }, [activeTab, user])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const data = await serviceRequestService.getPendingRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOfferPrice = async (requestId: number, technicianPrice: number) => {
    try {
      setActionLoading(requestId)
      await serviceRequestService.offerPrice(requestId, { technicianPrice })
      // Refresh the list
      await fetchPendingRequests()
    } catch (error) {
      console.error('Error offering price:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAcceptDirectly = async (requestId: number) => {
    try {
      setActionLoading(requestId)
      await serviceRequestService.acceptAndSchedule(requestId)
      // Refresh the list
      await fetchPendingRequests()
    } catch (error) {
      console.error('Error accepting request:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expirada'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`
    }
    return `${minutes}m restantes`
  }

  if (activeTab !== 'main' || user?.role !== 'technician') {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trabajos Disponibles</h1>
        <p className="text-gray-600">Encuentra solicitudes de servicio pendientes de los clientes</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl text-blue-600 mr-3">🔧</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              <p className="text-sm text-gray-600">Trabajos Disponibles</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl text-green-600 mr-3">💰</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${requests.reduce((sum, req) => sum + req.clientPrice, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Valor Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl text-orange-600 mr-3">⏰</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(req => req.expiresAt && new Date(req.expiresAt) > new Date()).length}
              </p>
              <p className="text-sm text-gray-600">Urgentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay trabajos disponibles
          </h3>
          <p className="text-gray-600">
            No hay solicitudes pendientes en este momento. Revisa más tarde.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.appliance.name} - {request.appliance.brand}
                  </h3>
                  <p className="text-sm text-gray-600">Modelo: {request.appliance.model}</p>
                  <p className="text-sm text-gray-600">Cliente: {request.client.firstName} {request.client.firstLastName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${request.clientPrice.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Precio ofrecido</p>
                  {request.expiresAt && (
                    <p className="text-xs text-orange-600 mt-1">
                      {getTimeRemaining(request.expiresAt)}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{request.description}</p>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Publicada: {formatDate(request.createdAt)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAcceptDirectly(request.id)}
                  disabled={actionLoading === request.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === request.id ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </span>
                  ) : (
                    'Aceptar Precio'
                  )}
                </button>
                
                <div className="flex-1 flex">
                  <input
                    type="number"
                    placeholder="Tu precio"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id={`price-${request.id}`}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`price-${request.id}`) as HTMLInputElement
                      const price = parseFloat(input.value)
                      if (price && price > 0) {
                        handleOfferPrice(request.id, price)
                      }
                    }}
                    disabled={actionLoading === request.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Contraoferta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AvailableJobs