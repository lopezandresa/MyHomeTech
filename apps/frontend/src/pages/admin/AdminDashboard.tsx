import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUsers, 
  FiTool, 
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiAlertCircle
} from 'react-icons/fi'
import { adminService } from '../../services/adminService'
import type { AdminStats, AdminUserManagement, UserFilters } from '../../types'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminStatsCard from '../../components/admin/AdminStatsCard'
import UserManagementTable from '../../components/admin/UserManagementTable'
import TechnicianPerformanceTable from '../../components/admin/TechnicianPerformanceTable'
import ServiceRequestChart from '../../components/admin/ServiceRequestChart'
import EditUserModal from '../../components/admin/EditUserModal'
import CreateAdminModal from '../../components/admin/CreateAdminModal'

/**
 * Panel principal de administrador para MyHomeTech
 * Integra todas las métricas y gestión del sistema de servicios técnicos
 */
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [serviceRequestData, setServiceRequestData] = useState<any>(null)
  const [technicianPerformance, setTechnicianPerformance] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'technicians'>('overview')

  // Filtros para gestión de usuarios
  const [userFilters, setUserFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: ''
  })
  // Estados para el modal de edición
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserManagement | null>(null)
  
  // Estados para el modal de crear admin
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar todas las estadísticas en paralelo
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

      setStats(systemStats)
      setServiceRequestData(serviceStats)
      setTechnicianPerformance(techPerformance)
      setUsers(allUsers)

    } catch (err: any) {
      console.error('Error loading dashboard data:', err)
      setError('Error al cargar los datos del dashboard. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleUserStatusToggle = async (userId: number) => {
    try {
      await adminService.toggleUserStatus(userId)
      // Recargar usuarios después del cambio
      const updatedUsers = await adminService.getAllUsers()
      setUsers(updatedUsers)
      
      // Actualizar estadísticas si es necesario
      const updatedStats = await adminService.getSystemStats()
      setStats(updatedStats)
    } catch (err: any) {
      console.error('Error toggling user status:', err)
      setError('Error al cambiar el estado del usuario.')
    }
  }

  const getFilteredUsers = () => {
    return users.filter(user => {
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
  }
  const handleEditUser = (user: AdminUserManagement) => {
    setSelectedUser(user)
    setShowEditUserModal(true)
  }

  const handleCreateAdmin = async () => {
    setShowCreateAdminModal(false)
    // Recargar usuarios después de crear admin
    try {
      const updatedUsers = await adminService.getAllUsers()
      setUsers(updatedUsers)
    } catch (error) {
      console.error('Error al recargar usuarios:', error)
    }
  }

  const handleUserUpdate = async (userId: number, userData: any) => {
    try {
      await adminService.updateUser(userId, userData)
      // Recargar usuarios después del cambio
      const updatedUsers = await adminService.getAllUsers()
      setUsers(updatedUsers)
      
      // Actualizar estadísticas si es necesario
      const updatedStats = await adminService.getSystemStats()
      setStats(updatedStats)
      
      setShowEditUserModal(false)
      setSelectedUser(null)
    } catch (err: any) {
      console.error('Error updating user:', err)
      setError('Error al actualizar el usuario.')
      throw err // Re-throw para que el modal pueda manejar el error
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout currentPage="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Error</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administrador</h1>
            <p className="text-gray-600">Gestión y estadísticas de MyHomeTech</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FiTrendingUp className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>

        {/* Navegación por pestañas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestión de Usuarios
            </button>
            <button
              onClick={() => setActiveTab('technicians')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'technicians'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rendimiento de Técnicos
            </button>
          </nav>
        </div>

        {/* Contenido según la pestaña activa */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Tarjetas de estadísticas principales */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AdminStatsCard
                    title="Total Usuarios"
                    value={stats.totalUsers}
                    icon={<FiUsers className="h-6 w-6" />}
                    color="blue"
                    trend="up"
                    trendValue={5.2}
                  />
                  <AdminStatsCard
                    title="Técnicos Activos"
                    value={stats.totalTechnicians}
                    icon={<FiTool className="h-6 w-6" />}
                    color="green"
                    trend="up"
                    trendValue={2.1}
                  />
                  <AdminStatsCard
                    title="Servicios Completados"
                    value={stats.completedRequests}
                    icon={<FiCheckCircle className="h-6 w-6" />}
                    color="purple"
                    trend="up"
                    trendValue={8.3}
                  />
                </div>
              )}

              {/* Estadísticas adicionales */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <FiClock className="h-8 w-8 text-yellow-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                        <p className="text-gray-600">Solicitudes Pendientes</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <FiCalendar className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalServiceRequests}</p>
                        <p className="text-gray-600">Total Solicitudes</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <FiUsers className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                        <p className="text-gray-600">Usuarios Activos</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {serviceRequestData && (
                  <ServiceRequestChart
                    data={serviceRequestData.monthly}
                    totals={serviceRequestData.totals}
                  />
                )}
              </div>
            </div>
          )}          {activeTab === 'users' && (
            <UserManagementTable
              users={getFilteredUsers()}
              filters={userFilters}
              onFilterChange={(newFilters) => setUserFilters(prev => ({ ...prev, ...newFilters }))}
              onToggleStatus={handleUserStatusToggle}
              loading={false}
              onEditUser={handleEditUser}
              onCreateAdmin={() => setShowCreateAdminModal(true)}
            />
          )}

          {activeTab === 'technicians' && (
            <TechnicianPerformanceTable
              technicians={technicianPerformance}
              loading={false}
            />
          )}
        </motion.div>      {/* Modal de edición de usuario */}
      {showEditUserModal && (
        <EditUserModal
          isOpen={showEditUserModal}
          user={selectedUser}
          onClose={() => {
            setShowEditUserModal(false)
            setSelectedUser(null)
          }}
          onSave={handleUserUpdate}
        />
      )}

      {/* Modal Crear Administrador */}
      {showCreateAdminModal && (
        <CreateAdminModal
          onClose={() => setShowCreateAdminModal(false)}
          onSuccess={handleCreateAdmin}
        />
      )}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard