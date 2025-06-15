import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { adminService } from '../services/adminService'
import type { AdminStats, AdminUserManagement, UserFilters } from '../types'
import AdminStatsCard from '../components/admin/AdminStatsCard' 
import UserManagementTable from '../components/admin/UserManagementTable'
import CreateAdminModal from '../components/admin/CreateAdminModal'
import EditUserModal from '../components/admin/EditUserModal'
import { FiUsers, FiUserPlus, FiSettings, FiActivity } from 'react-icons/fi'

/**
 * Página del panel de administrador
 */
const AdminPage: React.FC = () => {  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [filteredUsers, setFilteredUsers] = useState<AdminUserManagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserManagement | null>(null)
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: ''
  })
  // Verificar que el usuario sea administrador
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters]) // Solo aplicar filtros cuando cambien los filtros, no cuando cambien los usuarios

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [statsData] = await Promise.all([
        adminService.getSystemStats(),
        // No necesitamos cargar todos los usuarios ya que usamos getFilteredUsers directamente
      ])
      
      setStats(statsData)
      
      // Aplicar filtros después de cargar los datos
      const filtered = await adminService.getFilteredUsers(filters)
      setFilteredUsers(filtered)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los datos del panel de administrador')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    try {
      const filtered = await adminService.getFilteredUsers(filters)
      setFilteredUsers(filtered)
    } catch (err) {
      console.error('Error al aplicar filtros:', err)
    }
  }

  const handleToggleUserStatus = async (userId: number) => {
    try {
      await adminService.toggleUserStatus(userId)
      await loadData() // Recargar datos después del cambio
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err)
      setError('Error al cambiar el estado del usuario')
    }
  }
  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }
  const handleCreateAdmin = async () => {
    setShowCreateModal(false)
    await loadData() // Recargar datos después de crear admin
  }

  const handleEditUser = (user: AdminUserManagement) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleUserUpdate = async (userId: number, userData: any) => {
    try {
      await adminService.updateUser(userId, userData)
      await loadData() // Recargar datos después de actualizar usuario
      setShowEditModal(false)
      setSelectedUser(null)
    } catch (err) {
      console.error('Error al actualizar usuario:', err)
      throw err // Re-throw para que el modal pueda manejar el error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona usuarios y visualiza estadísticas del sistema
              </p>
            </div>
            <button
              onClick={() => console.log('Crear administrador')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FiUserPlus />
              Crear Administrador
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiActivity className="text-blue-600" />
              Estadísticas del Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatsCard
                title="Total de Usuarios"
                value={stats.totalUsers}
                icon={<FiUsers className="h-6 w-6" />}
                color="blue"
              />
              <AdminStatsCard
                title="Clientes"
                value={stats.totalClients}
                icon={<FiUsers className="h-6 w-6" />}
                color="green"
              />
              <AdminStatsCard
                title="Técnicos"
                value={stats.totalTechnicians}
                icon={<FiUsers className="h-6 w-6" />}
                color="purple"
              />
              <AdminStatsCard
                title="Administradores"
                value={stats.totalAdmins}
                icon={<FiSettings className="h-6 w-6" />}
                color="orange"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <AdminStatsCard
                title="Usuarios Activos"
                value={stats.activeUsers}
                icon={<FiActivity className="h-6 w-6" />}
                color="green"
              />
              <AdminStatsCard
                title="Usuarios Inactivos"
                value={stats.inactiveUsers}
                icon={<FiActivity className="h-6 w-6" />}
                color="red"
              />
              <AdminStatsCard
                title="Solicitudes Pendientes"
                value={stats.pendingRequests}
                icon={<FiActivity className="h-6 w-6" />}
                color="yellow"
              />
            </div>
          </div>
        )}

        {/* Gestión de Usuarios */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiUsers className="text-blue-600" />
            Gestión de Usuarios
          </h2>            <UserManagementTable
            users={filteredUsers}
            filters={filters}
            onFilterChange={handleFilterChange}
            onToggleStatus={handleToggleUserStatus}
            onEditUser={handleEditUser}
            onCreateAdmin={() => setShowCreateModal(true)}
            loading={loading}
          /></div>
      </div>      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateAdmin}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSave={handleUserUpdate}
        />
      )}
    </div>
  )
}

export default AdminPage