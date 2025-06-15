import React, { useState, useEffect } from 'react'
import { Users, UserPlus, BarChart3 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { type AdminUserManagement, type AdminStats } from '../../types'
import AdminStatsComponent from './AdminStats'
import UserManagement from './UserManagement'
import CreateAdminModal from './CreateAdminModal'

/**
 * Panel principal de administrador
 * Componente que maneja toda la funcionalidad administrativa del sistema
 */
const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'create-admin'>('dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUserManagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [statsData, usersData] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getAllUsers()
      ])
      
      setStats(statsData)
      setUsers(usersData)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar los datos del sistema')
    } finally {
      setLoading(false)
    }
  }

  const handleUserStatusToggle = async (userId: number) => {
    try {
      await adminService.toggleUserStatus(userId)
      await loadData() // Recargar datos
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err)
      setError('Error al cambiar el estado del usuario')
    }
  }

  const handleCreateAdmin = async () => {
    setShowCreateModal(false)
    await loadData() // Recargar datos después de crear admin
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administrador</h1>
              <p className="text-gray-600">Gestiona usuarios y supervisa el sistema</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Crear Administrador
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gestión de Usuarios
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}        {activeTab === 'dashboard' && stats && (
          <AdminStatsComponent stats={stats} loading={loading} />
        )}

        {activeTab === 'users' && (
          <UserManagement 
            users={users} 
            onUserStatusToggle={handleUserStatusToggle}
            onRefresh={loadData}
          />
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateAdmin}
        />
      )}
    </div>
  )
}

export default AdminPanel