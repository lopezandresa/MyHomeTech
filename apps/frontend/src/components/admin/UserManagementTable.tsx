import React from 'react'
import type { AdminUserManagement, UserFilters } from '../../types'
import { FiSearch, FiFilter, FiToggleLeft, FiToggleRight, FiUser, FiMail, FiEdit2, FiUserPlus } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

interface UserManagementTableProps {
  users: AdminUserManagement[]
  filters: UserFilters
  onFilterChange: (filters: Partial<UserFilters>) => void
  onToggleStatus: (userId: number) => void
  onEditUser: (user: AdminUserManagement) => void
  onCreateAdmin?: () => void
  loading: boolean
}

/**
 * Componente de tabla para gestión de usuarios en el panel de administrador
 */
const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  filters,
  onFilterChange,
  onToggleStatus,
  onEditUser,
  onCreateAdmin,
  loading
}) => {
  const { user: currentUser } = useAuth()
  const isCurrentUserAdmin = currentUser?.role === 'admin'
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'technician':
        return 'bg-blue-100 text-blue-800'
      case 'client':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-ES')
  }

  return (    <div className="bg-white shadow rounded-lg">
      {/* Header con título y botón crear admin */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h2>
          {onCreateAdmin && isCurrentUserAdmin && (
            <button
              onClick={onCreateAdmin}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiUserPlus className="w-4 h-4" />
              Crear Administrador
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro por rol */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              value={filters.role}
              onChange={(e) => onFilterChange({ role: e.target.value as UserFilters['role'] })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="client">Clientes</option>
              <option value="technician">Técnicos</option>
              <option value="admin">Administradores</option>
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value as UserFilters['status'] })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">No se encontraron usuarios con los filtros aplicados</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profilePhotoUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePhotoUrl}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FiUser className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.firstLastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FiMail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'technician' ? 'Técnico' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                      {user.status ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Botón de Editar */}
                      <button
                        onClick={() => onEditUser(user)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        title="Editar usuario"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Editar
                      </button>

                      {/* Botón de Activar */}
                      {!user.status && (
                        <button
                          onClick={() => onToggleStatus(user.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          title="Activar usuario"
                        >
                          <FiToggleLeft className="w-4 h-4" />
                          Activar
                        </button>
                      )}

                      {/* Botón de Desactivar */}
                      {user.status && (
                        <button
                          onClick={() => onToggleStatus(user.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          title="Desactivar usuario"
                        >
                          <FiToggleRight className="w-4 h-4" />
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación / Información adicional */}
      {users.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementTable