import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  WrenchScrewdriverIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { serviceRequestService } from '../../services/serviceRequestService'
import type { ServiceRequest } from '../../types/index'

const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([])
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'assigned'>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [pending, assigned] = await Promise.all([
        serviceRequestService.getPendingRequests(),
        user ? serviceRequestService.getTechnicianRequests(user.id) : Promise.resolve([])
      ])
      setPendingRequests(pending)
      setMyRequests(assigned)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMakeOffer = async (requestId: number) => {
    if (!offerPrice) return
    
    try {
      await serviceRequestService.offerPrice(requestId, { 
        technicianPrice: parseFloat(offerPrice) 
      })
      setOfferPrice('')
      setSelectedRequest(null)
      await loadData()
    } catch (error) {
      console.error('Error making offer:', error)
      setError('Error al hacer la oferta')
    }
  }

  const handleAcceptDirectly = async (requestId: number) => {
    try {
      await serviceRequestService.acceptAndSchedule(requestId)
      await loadData()
    } catch (error) {
      console.error('Error accepting request:', error)
      setError('Error al aceptar la solicitud')
    }
  }

  const handleSchedule = async (requestId: number) => {
    if (!scheduleDate) return
    
    try {
      await serviceRequestService.scheduleRequest(requestId, { 
        scheduledAt: scheduleDate 
      })
      setScheduleDate('')
      setSelectedRequest(null)
      await loadData()
    } catch (error) {
      console.error('Error scheduling:', error)
      setError('Error al programar el servicio')
    }
  }

  const handleReject = async (requestId: number) => {
    try {
      await serviceRequestService.rejectRequest(requestId)
      await loadData()
    } catch (error) {
      console.error('Error rejecting request:', error)
      setError('Error al rechazar la solicitud')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'offered':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'offered':
        return 'Oferta Enviada'
      case 'accepted':
        return 'Aceptada'
      case 'scheduled':
        return 'Programada'
      case 'in_progress':
        return 'En Progreso'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Técnico</h1>
          <p className="text-gray-600 mt-2">Gestiona las solicitudes de servicio y tus trabajos asignados</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Cerrar
            </button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Solicitudes Disponibles ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assigned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mis Servicios ({myRequests.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'pending' ? (
          <div>
            {pendingRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes disponibles</h3>
                <p className="text-gray-600">Las nuevas solicitudes aparecerán aquí</p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {pendingRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.appliance.name}
                          </h3>
                          <p className="text-gray-600">
                            Cliente: {request.client.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Publicada el {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Problema reportado:</h4>
                      <p className="text-gray-600">{request.description}</p>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-500">Precio ofrecido por el cliente:</span>
                      <p className="text-xl font-bold text-green-600">
                        ${request.clientPrice.toLocaleString()} COP
                      </p>
                    </div>

                    {request.expiresAt && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium text-yellow-600">Expira el:</span>
                        <p className="font-medium text-yellow-800">
                          {new Date(request.expiresAt).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleAcceptDirectly(request.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Aceptar ${request.clientPrice.toLocaleString()}
                      </button>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Hacer Contraoferta
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Rechazar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {myRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes servicios asignados</h3>
                <p className="text-gray-600">Tus servicios aceptados aparecerán aquí</p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {myRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <WrenchScrewdriverIcon className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.appliance.name}
                          </h3>
                          <p className="text-gray-600">
                            Cliente: {request.client.name}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Descripción:</h4>
                      <p className="text-gray-600">{request.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Precio acordado:</span>
                        <p className="text-lg font-semibold text-green-600">
                          ${(request.technicianPrice || request.clientPrice).toLocaleString()} COP
                        </p>
                      </div>
                      {request.scheduledAt && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Fecha programada:</span>
                          <p className="font-medium">
                            {new Date(request.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.status === 'accepted' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Programar Servicio
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal para hacer oferta */}
        {selectedRequest && selectedRequest.status === 'pending' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Hacer Contraoferta</h3>
              <p className="text-gray-600 mb-4">
                El cliente ofrece ${selectedRequest.clientPrice.toLocaleString()} COP
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu contraoferta (COP)
                </label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  min={selectedRequest.clientPrice}
                  step="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa tu precio"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setSelectedRequest(null)
                    setOfferPrice('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleMakeOffer(selectedRequest.id)}
                  disabled={!offerPrice}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Enviar Oferta
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal para programar */}
        {selectedRequest && selectedRequest.status === 'accepted' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Programar Servicio</h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora del servicio
                </label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setSelectedRequest(null)
                    setScheduleDate('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSchedule(selectedRequest.id)}
                  disabled={!scheduleDate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Programar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TechnicianDashboard