import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XCircleIcon,
  BellIcon,
  WifiIcon,
  ArrowPathIcon,
  XMarkIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { useDashboardData } from '../../hooks/useDashboardData'
import { useDashboardActions } from '../../hooks/useDashboardActions'
import { ConnectionState } from '../../hooks/useRealTimeServiceRequests'
import DashboardLayout from './DashboardLayout'
import ServiceRequestForm from '../ServiceRequestForm'
import ClientProfile from './ClientProfile'
import TechnicianProfile from './TechnicianProfile'
import { ClientNotifications } from '../ClientNotifications'
import { ClientRequests } from './ClientRequests'
import { AvailableJobs } from './AvailableJobs'
import { TechnicianJobs } from './TechnicianJobs'
import { MultiOfferDebug } from '../MultiOfferDebug'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Hook personalizado para datos del dashboard
  const dashboardData = useDashboardData()
  
  // Hook personalizado para acciones del dashboard
  const dashboardActions = useDashboardActions({
    isClient: dashboardData.isClient,
    isTechnician: dashboardData.isTechnician,
    user: dashboardData.user,
    setError: dashboardData.setError,
    setClientRequests: dashboardData.setClientRequests,
    setPendingRequests: dashboardData.setPendingRequests,
    setMyRequests: dashboardData.setMyRequests,
    loadData: dashboardData.loadData
  })

  // Estados adicionales para UI
  const [showConnectionDetails, setShowConnectionDetails] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showRecentJobAlert, setShowRecentJobAlert] = useState(false)

  // Efecto para mostrar alerta de nuevos trabajos para técnicos
  useEffect(() => {
    if (dashboardData.isTechnician && dashboardData.technicianNotifications.notifications.length > 0) {
      const latestNotification = dashboardData.technicianNotifications.notifications[0]
      if (latestNotification.type === 'new') {
        setShowRecentJobAlert(true)
        setTimeout(() => setShowRecentJobAlert(false), 10000)
      }
    }
  }, [dashboardData.isTechnician, dashboardData.technicianNotifications.notifications.length])

  const handleReconnect = () => {
    if (dashboardData.isTechnician) {
      dashboardData.technicianNotifications.forceReconnect()
    }
  }

  // Renderizado según pestaña activa
  const renderContent = (activeTab: string) => {
    if (dashboardData.isClient) {
      switch (activeTab) {
        case 'main':
          return (
            <ClientRequests
              isLoading={dashboardData.isLoading}
              error={dashboardData.error}
              setError={dashboardData.setError}
              clientRequests={dashboardData.clientRequests}
              requestFilter={dashboardData.requestFilter}
              setRequestFilter={dashboardData.setRequestFilter}
              setShowNewRequestModal={dashboardActions.setShowNewRequestModal}
              handleCompleteService={dashboardActions.handleCompleteService}
              handleAcceptSpecificOffer={dashboardActions.handleAcceptSpecificOffer}
              handleCancelRequest={dashboardActions.handleCancelRequest}
              handleUpdateClientPrice={dashboardActions.handleUpdateClientPrice}
            />
          )
        case 'profile':
          return <ClientProfile />
        default:
          return (
            <ClientRequests
              isLoading={dashboardData.isLoading}
              error={dashboardData.error}
              setError={dashboardData.setError}
              clientRequests={dashboardData.clientRequests}
              requestFilter={dashboardData.requestFilter}
              setRequestFilter={dashboardData.setRequestFilter}
              setShowNewRequestModal={dashboardActions.setShowNewRequestModal}
              handleCompleteService={dashboardActions.handleCompleteService}
              handleAcceptSpecificOffer={dashboardActions.handleAcceptSpecificOffer}
              handleCancelRequest={dashboardActions.handleCancelRequest}
              handleUpdateClientPrice={dashboardActions.handleUpdateClientPrice}
            />
          )
      }
    } else if (dashboardData.isTechnician) {
      switch (activeTab) {
        case 'main':
          return (
            <AvailableJobs
              isLoading={dashboardData.isLoading}
              error={dashboardData.error}
              setError={dashboardData.setError}
              pendingRequests={dashboardData.pendingRequests}
              setPendingRequests={dashboardData.setPendingRequests}
              showRecentJobAlert={showRecentJobAlert}
              setShowRecentJobAlert={setShowRecentJobAlert}
              technicianNotifications={dashboardData.technicianNotifications}
              handleAcceptDirectly={dashboardActions.handleAcceptDirectly}
              setSelectedRequest={dashboardActions.setSelectedRequest}
              handleReconnect={handleReconnect}
            />
          )
        case 'my-jobs':
          return (
            <TechnicianJobs
              myRequests={dashboardData.myRequests}
              technicianNotifications={dashboardData.technicianNotifications}
              setSelectedRequest={dashboardActions.setSelectedRequest}
              handleReconnect={handleReconnect}
            />
          )
        case 'profile':
          return <TechnicianProfile />
        default:
          return (
            <AvailableJobs
              isLoading={dashboardData.isLoading}
              error={dashboardData.error}
              setError={dashboardData.setError}
              pendingRequests={dashboardData.pendingRequests}
              setPendingRequests={dashboardData.setPendingRequests}
              showRecentJobAlert={showRecentJobAlert}
              setShowRecentJobAlert={setShowRecentJobAlert}
              technicianNotifications={dashboardData.technicianNotifications}
              handleAcceptDirectly={dashboardActions.handleAcceptDirectly}
              setSelectedRequest={dashboardActions.setSelectedRequest}
              handleReconnect={handleReconnect}
            />
          )
      }
    }
    return null
  }

  // Preparar el contenido del lado derecho según el rol
  const getRightContent = () => {
    if (dashboardData.isClient) {
      return (
        <ClientNotifications 
          notifications={dashboardData.clientNotifications.notifications} 
          isConnected={dashboardData.clientNotifications.isConnected}
          hasUnreadNotifications={dashboardData.clientNotifications.hasUnreadNotifications}
          onDismiss={dashboardData.clientNotifications.dismissNotification}
          onMarkAsRead={dashboardData.clientNotifications.markAsRead}
          onMarkAllAsRead={dashboardData.clientNotifications.markAllAsRead}
          onClear={dashboardData.clientNotifications.clearNotifications}
        />
      )
    } else if (dashboardData.isTechnician) {
      return (
        <div className="flex items-center space-x-4">
          {/* Indicador de conexión WebSocket */}
          <div className="relative">
            <button
              onClick={() => setShowConnectionDetails(!showConnectionDetails)}
              className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              {dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING ? (
                <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />
              ) : (
                <WifiIcon className={`h-5 w-5 ${dashboardData.technicianNotifications.isConnected ? 'text-green-500' : 'text-red-500'}`} />
              )}
              <span className={`text-sm ${
                dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED 
                  ? 'text-green-600' 
                  : dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED 
                  ? 'Conectado' 
                  : dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING
                  ? 'Conectando...' 
                  : 'Desconectado'
                }
              </span>
            </button>
            
            {/* Dropdown de estado de conexión */}
            <AnimatePresence>
              {showConnectionDetails && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Estado de Conexión</h3>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estado:</span>
                        <span className={`text-sm font-medium ${
                          dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED 
                            ? 'text-green-600' 
                            : dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED 
                            ? 'Conectado' 
                            : dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING
                            ? 'Conectando...' 
                            : 'Desconectado'
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Intentos:</span>
                        <span className="text-sm font-medium">
                          {dashboardData.technicianNotifications.connectionStatus.attempts} / {dashboardData.technicianNotifications.connectionStatus.maxAttempts}
                        </span>
                      </div>
                      
                      {dashboardData.technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING && dashboardData.technicianNotifications.connectionStatus.nextAttemptIn && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Reconectando en:</span>
                          <span className="text-sm font-medium">
                            {Math.round(dashboardData.technicianNotifications.connectionStatus.nextAttemptIn / 1000)}s
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {dashboardData.technicianNotifications.connectionStatus.state !== ConnectionState.CONNECTED && (
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={handleReconnect}
                          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                          <span>Reconectar ahora</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botón de notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg transition-colors ${
                dashboardData.technicianNotifications.hasUnreadNotifications 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BellIcon className="h-6 w-6" />
              {dashboardData.technicianNotifications.hasUnreadNotifications && (
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
                      {dashboardData.technicianNotifications.notifications.length > 0 && (
                        <button
                          onClick={dashboardData.technicianNotifications.clearNotifications}
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
                    {dashboardData.technicianNotifications.notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay notificaciones</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {dashboardData.technicianNotifications.notifications.map((notification: any, index: number) => (
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
                                onClick={() => dashboardData.technicianNotifications.dismissNotification(index)}
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
      )
    }
    return null
  }

  return (
    <>
      <DashboardLayout 
        title={dashboardData.isClient ? "Dashboard Cliente" : "Dashboard Técnico"}
        subtitle={dashboardData.isClient ? "Gestiona tus solicitudes de servicio" : "Gestiona tus trabajos y ofertas"}
        onNavigate={onNavigate}
        rightContent={getRightContent()}
      >
        {({ activeTab }) => renderContent(activeTab)}
      </DashboardLayout>

      {/* Modales específicos para clientes */}
      {dashboardData.isClient && dashboardActions.showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nueva Solicitud de Servicio</h2>
              <button 
                onClick={() => dashboardActions.setShowNewRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <ServiceRequestForm 
              onSuccess={() => {
                dashboardActions.setShowNewRequestModal(false)
                dashboardData.loadData()
              }}
              onError={(error) => dashboardData.setError(error)}
              onCancel={() => dashboardActions.setShowNewRequestModal(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Modal de contraoferta para técnicos */}
      {dashboardData.isTechnician && dashboardActions.selectedRequest && dashboardActions.selectedRequest.status === 'pending' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hacer Contraoferta</h3>
            <p className="text-gray-600 mb-4">
              El cliente ofrece ${dashboardActions.selectedRequest.clientPrice.toLocaleString()} COP
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu contraoferta (COP)
              </label>
              <input
                type="number"
                value={dashboardActions.offerPrice}
                onChange={(e) => dashboardActions.setOfferPrice(e.target.value)}
                min={dashboardActions.selectedRequest.clientPrice}
                step="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu precio"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  dashboardActions.setSelectedRequest(null)
                  dashboardActions.setOfferPrice('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => dashboardActions.handleMakeOffer(dashboardActions.selectedRequest!.id)}
                disabled={!dashboardActions.offerPrice || !dashboardActions.canMakeOffer}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  !dashboardActions.offerPrice || !dashboardActions.canMakeOffer 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {!dashboardActions.canMakeOffer 
                  ? `Espera ${dashboardActions.timeLeft}s` 
                  : 'Enviar Oferta'
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal para programar servicios (técnicos) */}
      {dashboardData.isTechnician && dashboardActions.selectedRequest && dashboardActions.selectedRequest.status === 'accepted' && (
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
                value={dashboardActions.scheduleDate}
                onChange={(e) => dashboardActions.setScheduleDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  dashboardActions.setSelectedRequest(null)
                  dashboardActions.setScheduleDate('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => dashboardActions.handleSchedule(dashboardActions.selectedRequest!.id)}
                disabled={!dashboardActions.scheduleDate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Programar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6">
          <MultiOfferDebug 
            clientId={dashboardData.isClient ? dashboardData.user?.id : undefined}
            technicianId={dashboardData.isTechnician ? dashboardData.user?.id : undefined}
          />
        </div>
      )}
    </>
  )
}

export default Dashboard
