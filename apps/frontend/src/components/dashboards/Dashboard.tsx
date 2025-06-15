import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XCircleIcon,
  BellIcon,
  WifiIcon,
  ArrowPathIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import DashboardLayout from './DashboardLayout'
import ServiceRequestForm from '../ServiceRequestForm'
import ClientProfile from './ClientProfile'
import TechnicianProfile from './TechnicianProfile'
import { ClientNotifications } from '../ClientNotifications'
import { ClientRequests } from './ClientRequests'
import { AvailableJobs } from './AvailableJobs'
import { TechnicianJobs } from './TechnicianJobs'
import RatingModal from '../RatingModal'
import { formatDate } from '../../utils/dateUtils'

// Importar componentes de administrador
import AdminStatsCard from '../admin/AdminStatsCard'
import UserManagementTable from '../admin/UserManagementTable'
import TechnicianPerformanceTable from '../admin/TechnicianPerformanceTable'
import ServiceRequestChart from '../admin/ServiceRequestChart'
import { adminService } from '../../services/adminService'
import EditUserModal from '../admin/EditUserModal'

// Utility function to format date
import { useDashboardData } from '../../hooks/useDashboardData'
import { useDashboardActions } from '../../hooks/useDashboardActions'
import { ConnectionState } from '../../hooks/useRealTimeServiceRequests'
import type { AdminStats, UserFilters } from '../../types'
import { FiUsers, FiTool, FiCheckCircle } from 'react-icons/fi'

const Dashboard: React.FC = () => {
  // Hook personalizado para datos del dashboard
  const dashboardData = useDashboardData()
  // Hook personalizado para acciones del dashboard
  const dashboardActions = useDashboardActions()

  // Estados adicionales para UI
  const [showConnectionDetails, setShowConnectionDetails] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showRecentJobAlert, setShowRecentJobAlert] = useState(false)

  // Estados específicos para administrador
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [adminTechnicianPerformance, setAdminTechnicianPerformance] = useState<any[]>([])
  const [adminServiceData, setAdminServiceData] = useState<any>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [userFilters, setUserFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: ''
  })

  // Estados para el modal de edición de usuario
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null)

  // Cargar datos de administrador
  const loadAdminData = useCallback(async () => {
    if (dashboardData.user?.role !== 'admin') return
    
    try {
      setAdminLoading(true)
      setAdminError(null)
      
      const [
        systemStats,
        serviceStats,
        techPerformance,
        allUsers
      ] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getServiceRequestStats(),
        adminService.getTechnicianPerformance(),
        adminService.getAllUsers()
      ])
      
      setAdminStats(systemStats)
      setAdminServiceData(serviceStats)
      setAdminTechnicianPerformance(techPerformance)
      setAdminUsers(allUsers)
    } catch (err: any) {
      console.error('Error loading admin data:', err)
      setAdminError('Error al cargar los datos del administrador')
    } finally {
      setAdminLoading(false)
    }
  }, [dashboardData.user?.role])

  // Cargar datos de administrador cuando el usuario sea admin
  useEffect(() => {
    if (dashboardData.user?.role === 'admin') {
      loadAdminData()
    }
  }, [dashboardData.user?.role, loadAdminData])

  // Manejar cambio de estado de usuario
  const handleToggleUserStatus = useCallback(async (userId: number) => {
    try {
      await adminService.toggleUserStatus(userId)
      await loadAdminData() // Recargar datos después del cambio
    } catch (err: any) {
      console.error('Error toggling user status:', err)
      setAdminError('Error al cambiar el estado del usuario')
    }
  }, [loadAdminData])

  // Filtrar usuarios para administrador
  const getFilteredUsers = useCallback(() => {
    return adminUsers.filter(user => {
      // Filtro por rol
      if (userFilters.role && userFilters.role !== 'all' && user.role !== userFilters.role) {
        return false
      }
      
      // Filtro por estado
      if (userFilters.status && userFilters.status !== 'all') {
        const isActive = userFilters.status === 'active'
        if (user.status !== isActive) {
          return false
        }
      }
      
      // Filtro por búsqueda
      if (userFilters.search) {
        const searchTerm = userFilters.search.toLowerCase()
        const fullName = `${user.firstName} ${user.firstLastName}`.toLowerCase()
        const email = user.email.toLowerCase()
        
        if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
          return false
        }
      }
      
      return true
    })
  }, [adminUsers, userFilters])

  // Funciones wrapper para ajustar firmas de función
  const handleCompleteServiceWrapper = useCallback((requestId: number) => {
    return dashboardActions.handleCompleteService(requestId, dashboardData.user?.id || 0)
  }, [dashboardActions.handleCompleteService, dashboardData.user?.id])

  const handleCancelRequestWrapper = useCallback((requestId: number) => {
    return dashboardActions.handleCancelRequest(requestId, dashboardData.user?.id || 0, 'Cancelado por el usuario')
  }, [dashboardActions.handleCancelRequest, dashboardData.user?.id])

  const handleAcceptAlternativeDateWrapper = useCallback((proposalId: number) => {
    return dashboardActions.handleAcceptAlternativeDate(0, dashboardData.user?.id || 0, proposalId)
  }, [dashboardActions.handleAcceptAlternativeDate, dashboardData.user?.id])

  const handleRejectAlternativeDateWrapper = useCallback((proposalId: number) => {
    return dashboardActions.handleRejectAlternativeDate(0, dashboardData.user?.id || 0, proposalId)
  }, [dashboardActions.handleRejectAlternativeDate, dashboardData.user?.id])

  const handleAcceptDirectlyWrapper = useCallback((requestId: number) => {
    return dashboardActions.handleAcceptDirectly(requestId, dashboardData.user?.id || 0)
  }, [dashboardActions.handleAcceptDirectly, dashboardData.user?.id])

  const handleProposeAlternativeDateWrapper = useCallback((requestId: number, alternativeDate: string) => {
    return dashboardActions.handleProposeAlternativeDate(requestId, dashboardData.user?.id || 0, alternativeDate)
  }, [dashboardActions.handleProposeAlternativeDate, dashboardData.user?.id])

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
      switch (activeTab) {        case 'main':
          return (
            <ClientRequests
              isLoading={dashboardData.isLoading}
              error={dashboardData.error}
              clientRequests={dashboardData.clientRequests}
              requestFilter={dashboardData.requestFilter as "all" | "in-progress"}
              setRequestFilter={dashboardData.setRequestFilter}              setShowNewRequestModal={dashboardActions.setShowNewRequestModal}
              handleCompleteService={handleCompleteServiceWrapper}
              handleCancelRequest={handleCancelRequestWrapper}
              handleAcceptAlternativeDate={handleAcceptAlternativeDateWrapper}
              handleRejectAlternativeDate={handleRejectAlternativeDateWrapper}
            />
          )
        case 'profile':
          return <ClientProfile />        
          default:
          return (
            <ClientRequests
              isLoading={dashboardData.isLoading}
              error={dashboardData.error}
              clientRequests={dashboardData.clientRequests}
              requestFilter={dashboardData.requestFilter as "all" | "in-progress"}
              setRequestFilter={dashboardData.setRequestFilter}
              setShowNewRequestModal={dashboardActions.setShowNewRequestModal}
              handleCompleteService={handleCompleteServiceWrapper}
              handleCancelRequest={handleCancelRequestWrapper}
              handleAcceptAlternativeDate={handleAcceptAlternativeDateWrapper}
              handleRejectAlternativeDate={handleRejectAlternativeDateWrapper}
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
              success={dashboardActions.success}
              setSuccess={dashboardActions.setSuccess}
              pendingRequests={dashboardData.pendingRequests}
              setPendingRequests={dashboardData.setPendingRequests}
              showRecentJobAlert={showRecentJobAlert}
              setShowRecentJobAlert={setShowRecentJobAlert}
              technicianNotifications={dashboardData.technicianNotifications}
              handleAcceptDirectly={handleAcceptDirectlyWrapper}
              setSelectedRequest={dashboardActions.setSelectedRequest}
              handleReconnect={handleReconnect}
              handleProposeAlternativeDate={handleProposeAlternativeDateWrapper}
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
              success={dashboardActions.success}
              setSuccess={dashboardActions.setSuccess}
              pendingRequests={dashboardData.pendingRequests}
              setPendingRequests={dashboardData.setPendingRequests}
              showRecentJobAlert={showRecentJobAlert}
              setShowRecentJobAlert={setShowRecentJobAlert}
              technicianNotifications={dashboardData.technicianNotifications}
              handleAcceptDirectly={handleAcceptDirectlyWrapper}
              setSelectedRequest={dashboardActions.setSelectedRequest}
              handleReconnect={handleReconnect}
              handleProposeAlternativeDate={handleProposeAlternativeDateWrapper}
            />
          )
      }
    } else if (dashboardData.user?.role === 'admin') {
      switch (activeTab) {
        case 'main':
          return (
            <div className="space-y-6">
              {adminError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{adminError}</p>
                  <button
                    onClick={loadAdminData}
                    className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {/* Tarjetas de estadísticas principales */}
              {adminStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AdminStatsCard
                    title="Total de Usuarios"
                    value={adminStats.totalUsers}
                    icon={<FiUsers className="h-6 w-6" />}
                    color="blue"
                  />
                  <AdminStatsCard
                    title="Técnicos Activos"
                    value={adminStats.totalTechnicians}
                    icon={<FiTool className="h-6 w-6" />}
                    color="green"
                  />
                  <AdminStatsCard
                    title="Servicios Completados"
                    value={adminStats.completedRequests}
                    icon={<FiCheckCircle className="h-6 w-6" />}
                    color="purple"
                  />
                </div>
              )}

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {adminServiceData && (
                  <ServiceRequestChart
                    data={adminServiceData.monthly}
                    totals={adminServiceData.totals}
                  />
                )}
              </div>
            </div>
          )
        case 'users':
          return (
            <UserManagementTable
              users={getFilteredUsers()}
              filters={userFilters}
              onFilterChange={(newFilters) => setUserFilters(prev => ({ ...prev, ...newFilters }))}
              onToggleStatus={handleToggleUserStatus}
              onEditUser={(user) => {
                setSelectedUserForEdit(user)
                setShowEditUserModal(true)
              }}
              loading={adminLoading}
            />
          )
        case 'technicians':
          return (
            <TechnicianPerformanceTable
              technicians={adminTechnicianPerformance}
              loading={adminLoading}
            />
          )
        case 'analytics':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Análisis y Reportes</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {adminServiceData && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitudes de Servicio</h3>
                    <ServiceRequestChart
                      data={adminServiceData.monthly}
                      totals={adminServiceData.totals}
                    />
                  </div>
                )}
                {adminTechnicianPerformance.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Técnicos</h3>
                    <TechnicianPerformanceTable
                      technicians={adminTechnicianPerformance}
                      loading={adminLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        default:
          return null
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
                    ) : null
                    // (
                    //   <div className="divide-y divide-gray-100">
                    //     {dashboardData.technicianNotifications.notifications.map((notification: any, index: number) => (
                    //       <motion.div
                    //         key={index}
                    //         initial={{ opacity: 0, x: -10 }}
                    //         animate={{ opacity: 1, x: 0 }}
                    //         className="p-4 hover:bg-gray-50 transition-colors"
                    //       >
                    //         <div className="flex items-start justify-between">
                    //           <div className="flex-1">
                    //             <div className="flex items-center space-x-2 mb-2">
                    //               <WrenchScrewdriverIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    //               <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    //                 notification.type === 'new' 
                    //                   ? 'bg-green-100 text-green-800' 
                    //                   : notification.type === 'updated'
                    //                   ? 'bg-blue-100 text-blue-800'
                    //                   : 'bg-red-100 text-red-800'
                    //               }`}>
                    //                 {notification.type === 'new' ? 'Nueva' : 
                    //                  notification.type === 'updated' ? 'Actualizada' : 'Removida'}
                    //               </span>
                    //             </div>
                    //             <h4 className="font-medium text-gray-900 text-sm">
                    //               {notification.serviceRequest?.appliance?.name || 'Solicitud de servicio'}
                    //             </h4>
                    //             <p className="text-xs text-gray-500">
                    //               {notification.timestamp?.toLocaleTimeString?.() || 'Fecha no disponible'}
                    //             </p>
                    //           </div>
                    //           <button
                    //             onClick={() => dashboardData.technicianNotifications.dismissNotification(index)}
                    //             className="text-gray-400 hover:text-gray-600 ml-2"
                    //           >
                    //             <XMarkIcon className="h-4 w-4" />
                    //           </button>
                    //         </div>
                    //       </motion.div>
                    //     ))}
                    //   </div>
                   // )
                    }
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
        title={
          dashboardData.isClient ? "Dashboard Cliente" : 
          dashboardData.isTechnician ? "Dashboard Técnico" : 
          dashboardData.user?.role === 'admin' ? "Panel de Administrador" : 
          "Dashboard"
        }
        subtitle={
          dashboardData.isClient ? "Gestiona tus solicitudes de servicio" : 
          dashboardData.isTechnician ? "Gestiona tus trabajos y ofertas" : 
          dashboardData.user?.role === 'admin' ? "Administra el sistema MyHomeTech" : 
          "Bienvenido al sistema"
        }
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
              onCancel={() => dashboardActions.setShowNewRequestModal(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Modal para proponer fecha alternativa (técnicos) */}
      {dashboardData.isTechnician && dashboardActions.selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Proponer Fecha Alternativa</h2>
              <button 
                onClick={() => {
                  dashboardActions.setSelectedRequest(null)
                  dashboardActions.setAlternativeDate('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Fecha propuesta por el cliente */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">Fecha solicitada por el cliente:</h4>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-lg font-semibold text-blue-800">
                    {formatDate(dashboardActions.selectedRequest.proposedDateTime)} a las {new Date(dashboardActions.selectedRequest.proposedDateTime).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>              {/* Información sobre conflicto */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-orange-800 mb-1">No disponible en esa fecha</h4>
                    <p className="text-sm text-orange-700">
                      Ya tienes un servicio programado para esa fecha o no tienes disponibilidad. 
                      Propón una fecha alternativa que funcione mejor para tu agenda.
                    </p>
                  </div>
                </div>
              </div>

              {/* Información sobre requisitos de propuestas */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Requisitos para propuestas</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Máximo 3 propuestas por solicitud</li>
                      <li>• Cada propuesta debe ser en horario diferente (mín. 1 hora de diferencia)</li>
                      <li>• Solo horarios de trabajo: 6:00 AM - 6:00 PM</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Selección de fecha y hora alternativa */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Propón una nueva fecha y hora</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha alternativa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>                      <input
                        type="date"
                        value={dashboardActions.alternativeDate ? dashboardActions.alternativeDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const timeValue = dashboardActions.alternativeDate ? 
                            dashboardActions.alternativeDate.split('T')[1] || '08:00' : 
                            '08:00'
                          dashboardActions.setAlternativeDate(`${e.target.value}T${timeValue}`)
                        }}
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora alternativa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                      </div>                      <select
                        value={dashboardActions.alternativeDate ? 
                          dashboardActions.alternativeDate.split('T')[1] || '08:00' : 
                          '08:00'}
                        onChange={(e) => {
                          const dateValue = dashboardActions.alternativeDate ? 
                            dashboardActions.alternativeDate.split('T')[0] : 
                            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          dashboardActions.setAlternativeDate(`${dateValue}T${e.target.value}`)
                        }}
                        className="w-full pl-10 appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        {(() => {
                          const options = []
                          for (let hour = 6; hour < 18; hour++) {
                            const timeString = `${hour.toString().padStart(2, '0')}:00`
                            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                            const ampm = hour >= 12 ? 'PM' : 'AM'
                            options.push(
                              <option key={timeString} value={timeString}>
                                {displayHour}:00 {ampm}
                              </option>
                            )
                          }
                          return options
                        })()}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1-2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Horario de servicio:</strong> 6:00 AM - 6:00 PM. 
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    💡 <strong>Tip:</strong> Cada propuesta debe tener al menos 30 minutos de diferencia con tus otras propuestas para darle opciones reales al cliente.
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>¿Qué sucede después?</strong> El cliente verá tu propuesta de fecha alternativa y podrá aceptarla o cancelar la solicitud. Si la acepta, el servicio quedará programado automáticamente.
                </p>
              </div>              {/* Botones */}
              <div className="flex space-x-4">
                <button
                  onClick={() => handleProposeAlternativeDateWrapper(dashboardActions.selectedRequest!.id, dashboardActions.alternativeDate)}
                  disabled={!dashboardActions.alternativeDate}
                  className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Proponer Fecha Alternativa
                </button>
                
                <button
                  onClick={() => {
                    dashboardActions.setSelectedRequest(null)
                    dashboardActions.setAlternativeDate('')
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Rating para clientes */}
      {dashboardData.isClient && dashboardActions.showRatingModal && dashboardActions.selectedRequestForRating && (
        <RatingModal
          isOpen={dashboardActions.showRatingModal}
          serviceRequest={dashboardActions.selectedRequestForRating}
          onClose={() => {
            dashboardActions.setShowRatingModal(false)
            dashboardActions.setSelectedRequestForRating(null)
          }}
          onSubmit={dashboardActions.handleSubmitRating}
        />
      )}

      {/* Modal de edición de usuario - ACTUALIZADO para usar EditUserModal */}
      <EditUserModal
        isOpen={showEditUserModal}
        user={selectedUserForEdit}
        onClose={() => {
          setShowEditUserModal(false)
          setSelectedUserForEdit(null)
        }}
        onSave={async (userId: number, userData: any) => {
          try {
            await adminService.updateUser(userId, userData)
            setShowEditUserModal(false)
            setSelectedUserForEdit(null)
            await loadAdminData()
          } catch (err: any) {
            console.error('Error updating user:', err)
            setAdminError('Error al actualizar el usuario')
            throw err // Re-throw para que el modal pueda manejar el error
          }
        }}
      />
    </>
  )
}

export default Dashboard
