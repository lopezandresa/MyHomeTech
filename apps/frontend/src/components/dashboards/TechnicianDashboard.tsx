import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon,
  BriefcaseIcon,
  BellIcon,
  WifiIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { serviceRequestService } from '../../services/serviceRequestService'
import { useRealTimeServiceRequests } from '../../hooks/useRealTimeServiceRequests'
import type { ServiceRequest } from '../../types/index'
import DashboardLayout from './DashboardLayout'
import TechnicianProfile from './TechnicianProfile'
import CountdownTimer from '../CountdownTimer'

interface TechnicianDashboardProps {
  onNavigate?: (page: string) => void
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([])
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')

  // Integrar sistema de notificaciones en tiempo real
  const {
    notifications,
    isConnected,
    requestNotificationPermission,
    clearNotifications,
    dismissNotification,
    hasUnreadNotifications
  } = useRealTimeServiceRequests(user?.id)

  // Estado para mostrar panel de notificaciones
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
      // Solicitar permisos de notificación cuando el componente se monta
      requestNotificationPermission()
    }
  }, [user, requestNotificationPermission])

  // Efecto para recargar datos cuando lleguen nuevas notificaciones
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]
      if (latestNotification.type === 'new') {
        // Agregar la nueva solicitud a la lista sin hacer una nueva petición
        setPendingRequests(prev => {
          const exists = prev.some(req => req.id === latestNotification.serviceRequest.id)
          if (!exists) {
            return [latestNotification.serviceRequest, ...prev]
          }
          return prev
        })
      } else if (latestNotification.type === 'removed') {
        // Remover solicitud de la lista
        setPendingRequests(prev => 
          prev.filter(req => req.id !== latestNotification.serviceRequest.id)
        )
      }
    }
  }, [notifications])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [pending, assigned] = await Promise.all([
        // Usar el endpoint filtrado por especialidades en lugar del general
        serviceRequestService.getPendingRequestsForMe(),
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
      case 'expired':
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
      case 'expired':
        return 'Expirada'
      default:
        return status
    }
  }

  const renderAvailableJobs = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando trabajos disponibles...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Trabajos Disponibles</h2>
          <span className="text-sm text-gray-600">{pendingRequests.length} solicitudes</span>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
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
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.appliance?.name || 'Electrodoméstico no disponible'}
                      </h3>
                      <p className="text-gray-600">
                        Cliente: {request.client?.firstName || 'N/A'} {request.client?.firstLastName || ''}
                      </p>
                      <p className="text-sm text-gray-500">
                        Publicada el {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    {/* Countdown Timer */}
                    {request.expiresAt && (
                      <CountdownTimer
                        expiresAt={request.expiresAt}
                        size="sm"
                        onExpire={() => {
                          // Remover la solicitud de la lista cuando expire
                          setPendingRequests(prev => 
                            prev.filter(req => req.id !== request.id)
                          )
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Problema reportado:</h4>
                  <p className="text-gray-600">{request.description}</p>
                </div>

                {/* Información de dirección */}
                {request.address && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Dirección del servicio:</h4>
                    <p className="text-gray-700">
                      {request.address.street} {request.address.number}
                      {request.address.apartment && `, Apt. ${request.address.apartment}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.address.city}, {request.address.state} - {request.address.postalCode}
                    </p>
                    {request.address.isDefault && (
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Dirección principal
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500">Precio ofrecido por el cliente:</span>
                  <p className="text-xl font-bold text-green-600">
                    ${request.clientPrice.toLocaleString()} COP
                  </p>
                </div>

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
    )
  }

  const renderMyJobs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mis Trabajos Asignados</h2>
        <span className="text-sm text-gray-600">{myRequests.length} trabajos</span>
      </div>

      {myRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes trabajos asignados</h3>
          <p className="text-gray-600">Los trabajos que aceptes aparecerán aquí</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {myRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.appliance?.name || 'Electrodoméstico no disponible'}
                    </h3>
                    <p className="text-gray-600">
                      Cliente: {request.client?.firstName || 'N/A'} {request.client?.firstLastName || ''}
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
  )
  const renderProfile = () => <TechnicianProfile />

  const renderContent = (activeTab: string) => {
    switch (activeTab) {
      case 'main':
        return renderAvailableJobs()
      case 'my-jobs':
        return renderMyJobs()
      case 'profile':
        return renderProfile()
      default:
        return renderAvailableJobs()
    }
  }

  return (
    <>
      <DashboardLayout 
        title="Dashboard Técnico"
        subtitle="Gestiona tus trabajos y ofertas"
        onNavigate={onNavigate}
        // Agregar indicadores en la barra superior
        rightContent={
          <div className="flex items-center space-x-4">
            {/* Indicador de conexión WebSocket */}
            <div className="flex items-center space-x-2">
              <WifiIcon className={`h-5 w-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>

            {/* Botón de notificaciones */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg transition-colors ${
                  hasUnreadNotifications 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BellIcon className="h-6 w-6" />
                {hasUnreadNotifications && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Panel de notificaciones */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                      <div className="flex items-center space-x-2">
                        {notifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Limpiar
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No hay notificaciones</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <WrenchScrewdriverIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      notification.type === 'new' 
                                        ? 'bg-green-100 text-green-800' 
                                        : notification.type === 'updated'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {notification.type === 'new' ? 'Nueva' : 
                                       notification.type === 'updated' ? 'Actualizada' : 'Removida'}
                                    </span>
                                  </div>
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {notification.serviceRequest.appliance.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-1">
                                    ${notification.serviceRequest.clientPrice.toLocaleString()} COP
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {notification.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => dismissNotification(index)}
                                  className="text-gray-400 hover:text-gray-600 ml-2"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        }
      >
        {({ activeTab }) => renderContent(activeTab)}
      </DashboardLayout>

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
    </>
  )
}

export default TechnicianDashboard
