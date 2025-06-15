import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/adminService'
import { useAuth } from '../contexts/AuthContext'
import type { User, ServiceRequest, AdminStats } from '../types'

/**
 * @fileoverview Hook personalizado para gestionar datos del dashboard de administrador
 * 
 * @description Proporciona estado y funciones para:
 * - Estadísticas del sistema
 * - Gestión de usuarios
 * - Gestión de solicitudes de servicio
 * - Reportes y logs
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

export const useAdminDashboard = () => {
  const { user } = useAuth()
  
  // Estados para estadísticas
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  // Estados para usuarios
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [admins, setAdmins] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  
  // Estados para solicitudes de servicio
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  
  // Estados para filtros y vista
  const [userFilter, setUserFilter] = useState<'all' | 'clients' | 'technicians' | 'admins'>('all')
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para modales y formularios
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  
  // Estados para errores y éxito
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin'

  /**
   * Cargar estadísticas del sistema
   */
  const loadStats = useCallback(async () => {
    if (!isAdmin) return
    
    setIsLoadingStats(true)
    setError(null)
      try {
      const statsData = await adminService.getSystemStats()
      setStats(statsData)
    } catch (err: any) {
      console.error('Error loading admin stats:', err)
      setError('Error al cargar estadísticas del sistema')
    } finally {
      setIsLoadingStats(false)
    }
  }, [isAdmin])

  /**
   * Cargar todos los usuarios del sistema
   */
  const loadUsers = useCallback(async () => {
    if (!isAdmin) return
    
    setIsLoadingUsers(true)
    setError(null)
    
    try {
      const [allUsersData, clientsData, techniciansData, adminsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getClients(),
        adminService.getTechnicians(),
        adminService.getAdmins()
      ])
      
      setAllUsers(allUsersData)
      setClients(clientsData)
      setTechnicians(techniciansData)
      setAdmins(adminsData)
    } catch (err: any) {
      console.error('Error loading users:', err)
      setError('Error al cargar usuarios del sistema')
    } finally {
      setIsLoadingUsers(false)
    }
  }, [isAdmin])

  /**
   * Cargar solicitudes de servicio
   */
  const loadServiceRequests = useCallback(async () => {
    if (!isAdmin) return
    
    setIsLoadingRequests(true)
    setError(null)
    
    try {
      const requestsData = requestFilter === 'all' 
        ? await adminService.getAllServiceRequests()
        : await adminService.getServiceRequestsByStatus(requestFilter)
      
      setServiceRequests(requestsData)
    } catch (err: any) {
      console.error('Error loading service requests:', err)
      setError('Error al cargar solicitudes de servicio')
    } finally {
      setIsLoadingRequests(false)
    }
  }, [isAdmin, requestFilter])

  /**
   * Crear nuevo administrador
   */
  const createAdmin = useCallback(async (adminData: any) => {
    if (!isAdmin) return false
    
    try {
      await adminService.createAdmin(adminData)
      setSuccess('Administrador creado exitosamente')
      setShowCreateAdminModal(false)
      await loadUsers()
      await loadStats()
      return true
    } catch (err: any) {
      console.error('Error creating admin:', err)
      setError(err.response?.data?.message || 'Error al crear administrador')
      return false
    }
  }, [isAdmin, loadUsers, loadStats])

  /**
   * Actualizar usuario
   */
  const updateUser = useCallback(async (userId: number, userData: any) => {
    if (!isAdmin) return false
    
    try {
      await adminService.updateUser(userId, userData)
      setSuccess('Usuario actualizado exitosamente')
      setShowEditUserModal(false)
      setSelectedUser(null)
      await loadUsers()
      return true
    } catch (err: any) {
      console.error('Error updating user:', err)
      setError(err.response?.data?.message || 'Error al actualizar usuario')
      return false
    }
  }, [isAdmin, loadUsers])

  /**
   * Activar/desactivar usuario
   */
  const toggleUserStatus = useCallback(async (userId: number) => {
    if (!isAdmin) return false
    
    try {
      await adminService.toggleUserStatus(userId)
      setSuccess('Estado del usuario actualizado')
      await loadUsers()
      return true
    } catch (err: any) {
      console.error('Error toggling user status:', err)
      setError(err.response?.data?.message || 'Error al cambiar estado del usuario')
      return false
    }
  }, [isAdmin, loadUsers])

  /**
   * Cancelar solicitud de servicio
   */
  const cancelServiceRequest = useCallback(async (requestId: number, reason: string) => {
    if (!isAdmin) return false
    
    try {
      await adminService.cancelServiceRequest(requestId, reason)
      setSuccess('Solicitud cancelada exitosamente')
      await loadServiceRequests()
      return true
    } catch (err: any) {
      console.error('Error cancelling service request:', err)
      setError(err.response?.data?.message || 'Error al cancelar solicitud')
      return false
    }
  }, [isAdmin, loadServiceRequests])

  /**
   * Filtrar usuarios según criterios
   */
  const getFilteredUsers = useCallback(() => {
    let users: User[] = []
    
    switch (userFilter) {
      case 'clients':
        users = clients
        break
      case 'technicians':
        users = technicians
        break
      case 'admins':
        users = admins
        break
      default:
        users = allUsers
    }
    
    if (searchTerm) {
      users = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return users
  }, [userFilter, searchTerm, allUsers, clients, technicians, admins])

  /**
   * Filtrar solicitudes según criterios
   */
  const getFilteredRequests = useCallback(() => {
    let requests = serviceRequests
    
    if (searchTerm) {
      requests = requests.filter(request => 
        request.appliance?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.client?.firstLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.technician?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.technician?.firstLastName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return requests
  }, [serviceRequests, searchTerm])

  /**
   * Limpiar mensajes de error y éxito
   */
  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  /**
   * Cargar todos los datos
   */
  const loadAllData = useCallback(async () => {
    if (!isAdmin) return
    
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadServiceRequests()
    ])
  }, [isAdmin, loadStats, loadUsers, loadServiceRequests])

  // Efectos para cargar datos iniciales
  useEffect(() => {
    if (isAdmin) {
      loadAllData()
    }
  }, [isAdmin, loadAllData])

  // Efecto para recargar solicitudes cuando cambia el filtro
  useEffect(() => {
    if (isAdmin) {
      loadServiceRequests()
    }
  }, [requestFilter, loadServiceRequests])

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success, clearMessages])

  return {
    // Estado de autenticación
    isAdmin,
    user,
    
    // Datos
    stats,
    allUsers,
    clients,
    technicians,
    admins,
    serviceRequests,
    
    // Estados de carga
    isLoadingStats,
    isLoadingUsers,
    isLoadingRequests,
    
    // Filtros y búsqueda
    userFilter,
    setUserFilter,
    requestFilter,
    setRequestFilter,
    searchTerm,
    setSearchTerm,
    
    // Estados de modales
    showCreateAdminModal,
    setShowCreateAdminModal,
    showEditUserModal,
    setShowEditUserModal,
    selectedUser,
    setSelectedUser,
    showRequestDetailsModal,
    setShowRequestDetailsModal,
    selectedRequest,
    setSelectedRequest,
    
    // Estados de error y éxito
    error,
    success,
    clearMessages,
    
    // Funciones de carga
    loadStats,
    loadUsers,
    loadServiceRequests,
    loadAllData,
    
    // Funciones de acción
    createAdmin,
    updateUser,
    toggleUserStatus,
    cancelServiceRequest,
    
    // Funciones de filtrado
    getFilteredUsers,
    getFilteredRequests
  }
}