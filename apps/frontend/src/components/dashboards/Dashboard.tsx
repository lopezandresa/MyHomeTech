import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FunnelIcon,
  PlusIcon,
  WrenchScrewdriverIcon, 
  BriefcaseIcon,
  BellIcon,
  WifiIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { serviceRequestService } from '../../services/serviceRequestService'
import { useRealTimeClientNotifications } from '../../hooks/useRealTimeClientNotifications'
import { useRealTimeServiceRequests, ConnectionState } from '../../hooks/useRealTimeServiceRequests'
import type { ServiceRequest } from '../../types/index'
import DashboardLayout from './DashboardLayout'
import ServiceRequestForm from '../ServiceRequestForm'
import ClientProfile from './ClientProfile'
import TechnicianProfile from './TechnicianProfile'
import { ClientNotifications } from '../ClientNotifications'
import CountdownTimer from '../CountdownTimer'
import { MultiOfferDebug } from '../MultiOfferDebug'
import { OfferCard } from '../OfferCard'
import { useOfferThrottle } from '../../hooks/useOfferThrottle'
import WebSocketDebug from '../WebSocketDebug'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth()
  const isClient = user?.role === 'client'
  const isTechnician = user?.role === 'technician'
  
  // Estados compartidos
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // ---- ESTADOS ESPECÍFICOS PARA CLIENTE ----
  const [clientRequests, setClientRequests] = useState<ServiceRequest[]>([])
  const [requestFilter, setRequestFilter] = useState<'in-progress' | 'all'>('in-progress')
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  
  // ---- ESTADOS ESPECÍFICOS PARA TÉCNICO ----
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([])
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [showConnectionDetails, setShowConnectionDetails] = useState(false)

  // Estado para mostrar notificaciones de nuevo trabajo
  const [showRecentJobAlert, setShowRecentJobAlert] = useState(false);

  // ---- HOOKS DE NOTIFICACIONES ----
  // Para clientes
  const clientNotifications = useRealTimeClientNotifications(isClient ? user?.id : undefined)
  
  // Para técnicos
  const technicianNotifications = useRealTimeServiceRequests(isTechnician ? user?.id : undefined)
  
  // Estado para mostrar panel de notificaciones
  const [showNotifications, setShowNotifications] = useState(false)  // ---- EFECTOS COMPARTIDOS ----
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // ---- EFECTO SEPARADO PARA TÉCNICOS ----
  useEffect(() => {
    if (user && isTechnician) {
      // Solicitar permisos de notificación para técnicos
      technicianNotifications.requestNotificationPermission()
      
      // Forzar una reconexión al montar el componente para asegurar que el WebSocket esté activo
      if (technicianNotifications.connectionStatus.state !== ConnectionState.CONNECTED) {
        console.log('🔄 Connection not established, forcing reconnect:', technicianNotifications.connectionStatus);
        technicianNotifications.forceReconnect()
      }
      
      // Debug logging del estado de conexión cada 3 segundos
      const debugInterval = setInterval(() => {
        console.log('🐛 Dashboard debug - Connection Status:', {
          isConnected: technicianNotifications.isConnected,
          connectionStatus: technicianNotifications.connectionStatus,
          state: technicianNotifications.connectionStatus.state,
          userId: user.id
        });
      }, 3000);
      
      return () => clearInterval(debugInterval);
    }
  }, [user?.id, isTechnician]); // Solo depende de user.id, no del objeto completo  // ---- EFECTO PARA TÉCNICOS: ACTUALIZAR LISTA CON NOTIFICACIONES ----
  useEffect(() => {
    if (isTechnician && technicianNotifications.notifications.length > 0) {
      const latestNotification = technicianNotifications.notifications[0]
      console.log('🔔 Processing technician notification:', latestNotification)
      
      if (latestNotification.type === 'new') {
        // Agregar la nueva solicitud a la lista sin hacer una nueva petición
        setPendingRequests(prev => {
          const exists = prev.some(req => req.id === latestNotification.serviceRequest.id)
          if (!exists) {
            console.log('➕ Adding new request to list:', latestNotification.serviceRequest.id)
            return [latestNotification.serviceRequest, ...prev]
          }
          return prev
        })
      } else if (latestNotification.type === 'removed') {
        // Remover solicitud de la lista
        console.log('➖ Removing request from list:', latestNotification.serviceRequest.id)
        setPendingRequests(prev => 
          prev.filter(req => req.id !== latestNotification.serviceRequest.id)
        )
      } else if (latestNotification.type === 'updated') {
        // Actualizar solicitud existente
        console.log('🔄 Updating request in list:', latestNotification.serviceRequest.id)
        setPendingRequests(prev => 
          prev.map(req => 
            req.id === latestNotification.serviceRequest.id 
              ? latestNotification.serviceRequest 
              : req
          )
        )
      }
      
      // También recargar las solicitudes asignadas por si hay cambios
      if (latestNotification.type === 'new' || latestNotification.type === 'updated') {
        setTimeout(() => {
          console.log('🔄 Recargando solicitudes asignadas después de notificación...');
          serviceRequestService.getTechnicianRequests(user!.id).then(setMyRequests);
        }, 500);
      }
    }
  }, [isTechnician, technicianNotifications.notifications, user?.id]) // Cambiar a dependencias completas
    // ---- EFECTO PARA CLIENTES: ACTUALIZAR LISTA CON NOTIFICACIONES ----
  useEffect(() => {
    if (isClient && clientNotifications.notifications.length > 0) {
      const latestNotification = clientNotifications.notifications[0]
      console.log('🔔 Processing client notification:', latestNotification)
      
      if (latestNotification.type === 'offer' || latestNotification.type === 'accepted' || 
          latestNotification.type === 'scheduled' || latestNotification.type === 'completed') {
        // Actualizar o agregar la solicitud
        setClientRequests(prev => {
          const existingIndex = prev.findIndex(req => req.id === latestNotification.serviceRequest.id)
          if (existingIndex >= 0) {
            // Actualizar solicitud existente
            console.log('🔄 Updating client request:', latestNotification.serviceRequest.id)
            const updated = [...prev]
            updated[existingIndex] = latestNotification.serviceRequest
            return updated
          } else {
            // Agregar nueva solicitud (por si acaso)
            console.log('➕ Adding new client request:', latestNotification.serviceRequest.id)
            return [latestNotification.serviceRequest, ...prev]
          }
        })
        
        // Recargar datos completos después de un breve delay para asegurar consistencia
        setTimeout(() => {
          console.log('🔄 Recargando datos completos del cliente después de notificación...');
          serviceRequestService.getClientRequests(user!.id).then(setClientRequests);
        }, 1000);
      }
      
      // Si la solicitud expiró, marcarla como expirada
      if (latestNotification.type === 'expired') {
        console.log('⏰ Marking request as expired:', latestNotification.serviceRequest.id)
        setClientRequests(prev => 
          prev.map(req => 
            req.id === latestNotification.serviceRequest.id 
              ? { ...req, status: 'expired' }
              : req
          )
        )
      }
    }
  }, [isClient, clientNotifications.notifications, user?.id]) // Cambiar a dependencias completas// ---- EFECTO PARA RECARGAR DATOS CUANDO SE RECONECTA (TÉCNICOS) ----
  useEffect(() => {
    if (isTechnician && technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED && user?.id) {
      // When we reconnect, reload the data
      console.log('✅ Conexión WebSocket restablecida para técnico, recargando datos...');
      loadData();
    }
  }, [isTechnician, technicianNotifications.connectionStatus.state, user?.id])

  // ---- EFECTO PARA RECARGAR DATOS CUANDO SE RECONECTA (CLIENTES) ----
  useEffect(() => {
    if (isClient && clientNotifications.isConnected && user?.id) {
      // When client reconnects, reload the data
      console.log('✅ Conexión WebSocket restablecida para cliente, recargando datos...');
      loadData();
    }
  }, [isClient, clientNotifications.isConnected, user?.id])

  // ---- EFECTO PARA ACTUALIZACIÓN AUTOMÁTICA PERIÓDICA (RESPALDO) ----
  useEffect(() => {
    if (!user) return;

    // Actualización automática cada 30 segundos como respaldo
    const interval = setInterval(() => {
      // Solo actualizar si no estamos cargando datos actualmente
      if (!isLoading) {
        console.log('🔄 Actualización automática periódica...');
        loadData();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [user?.id, isLoading])

  // ---- EFECTO PARA RECARGA CUANDO SE CREA UNA NUEVA SOLICITUD ----
  useEffect(() => {
    if (isClient && clientRequests.length > 0) {
      // Detectar si se agregó una nueva solicitud (la más reciente)
      const latestRequest = clientRequests[0];
      const now = new Date();
      const requestCreated = new Date(latestRequest.createdAt);
      const timeDiff = now.getTime() - requestCreated.getTime();
      
      // Si la solicitud se creó hace menos de 5 segundos, actualizar datos
      if (timeDiff < 5000) {
        console.log('🆕 Nueva solicitud detectada, actualizando datos...');
        setTimeout(() => loadData(), 1000); // Pequeño delay para asegurar consistencia
      }
    }
  }, [isClient, clientRequests.length])

  // ---- EFECTO PARA MOSTRAR ALERTA DE NUEVOS TRABAJOS ----
  useEffect(() => {
    if (isTechnician && technicianNotifications.notifications.length > 0) {
      const latestNotification = technicianNotifications.notifications[0];
      if (latestNotification.type === 'new') {
        setShowRecentJobAlert(true);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
          setShowRecentJobAlert(false);
        }, 10000);
      }
    }
  }, [isTechnician, technicianNotifications.notifications.length])
  // ---- FUNCIONES COMPARTIDAS ----
  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔄 Loading dashboard data for user:', user?.role, user?.id)
      
      if (isClient) {
        // Cargar datos para clientes
        console.log('📋 Loading client requests...')
        const clientData = await serviceRequestService.getClientRequests(user!.id)
        console.log('✅ Client requests loaded:', clientData.length)
        setClientRequests(clientData)
      } else if (isTechnician) {
        // No cargar datos si no estamos conectados (técnicos)
        if (technicianNotifications.connectionStatus.state !== ConnectionState.CONNECTED) {
          console.log('Skipping data load until connection is established');
          setIsLoading(false);
          return;
        }
        
        // Cargar datos para técnicos
        console.log('🔧 Loading technician data...')
        const [pending, assigned] = await Promise.all([
          serviceRequestService.getPendingRequestsForMe(),
          serviceRequestService.getTechnicianRequests(user!.id)
        ])
        console.log('✅ Technician data loaded:', { pending: pending.length, assigned: assigned.length })
        setPendingRequests(pending)
        setMyRequests(assigned)
      }
    } catch (error) {
      console.error('❌ Error loading data:', error)
      setError('Error al cargar los datos')
    } finally {
      setIsLoading(false)
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
        return isClient ? 'Con Oferta' : 'Oferta Enviada'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />
      case 'offered':
        return <CurrencyDollarIcon className="h-5 w-5" />
      case 'accepted':
      case 'scheduled':
        return <CalendarIcon className="h-5 w-5" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5" />
    }  }
  
  // ---- FUNCIONES ESPECÍFICAS PARA CLIENTES ----
  const handleCompleteService = async (requestId: number) => {
    try {
      await serviceRequestService.completeRequest(requestId)
      
      // Actualizar la solicitud en las listas correspondientes
      if (isClient) {
        setClientRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'completed', completedAt: new Date().toISOString() }
              : req
          )
        )
      }
      
      if (isTechnician) {
        setMyRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'completed', completedAt: new Date().toISOString() }
              : req
          )
        )
      }
      
      console.log('✅ Servicio completado, listas actualizadas automáticamente')
    } catch (error) {
      console.error('Error completing service:', error)
      setError('Error al marcar como completado')
    }
  }
  const handleAcceptSpecificOffer = async (serviceRequestId: number, offerId: number) => {
    try {
      const updatedRequest = await serviceRequestService.acceptSpecificOffer(serviceRequestId, offerId)
      
      // Actualizar la solicitud en la lista con la nueva información
      setClientRequests(prev => 
        prev.map(req => 
          req.id === serviceRequestId 
            ? { ...req, status: 'accepted', technicianId: updatedRequest.technicianId }
            : req
        )
      )
      
      console.log('✅ Oferta aceptada, solicitud actualizada automáticamente')
    } catch (error) {
      console.error('Error accepting specific offer:', error)
      setError('Error al aceptar la oferta')
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    try {
      await serviceRequestService.cancelRequest(requestId)
      
      // Actualizar el estado de la solicitud en lugar de removerla
      setClientRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : req
        )
      )
      
      console.log('✅ Solicitud cancelada, lista actualizada automáticamente')
    } catch (error) {
      console.error('Error cancelling request:', error)
      setError('Error al cancelar la solicitud')
    }
  }

  const handleUpdateClientPrice = async (requestId: number, currentPrice: number) => {
    const newPriceStr = prompt(`Precio actual: $${currentPrice.toLocaleString()} COP\n\nIngresa el nuevo precio:`, currentPrice.toString())
    
    if (!newPriceStr) return // Usuario canceló
    
    const newPrice = parseInt(newPriceStr.replace(/[^\d]/g, ''))
    
    if (!newPrice || newPrice <= 0) {
      alert('Por favor ingresa un precio válido')
      return
    }
    
    if (newPrice === currentPrice) {
      alert('El precio debe ser diferente al actual')
      return
    }

    try {
      const updatedRequest = await serviceRequestService.updateClientPrice(requestId, newPrice)
      
      // Actualizar la solicitud en la lista
      setClientRequests(prev => 
        prev.map(req => req.id === requestId ? updatedRequest : req)
      )
      
      alert(`Precio actualizado exitosamente a $${newPrice.toLocaleString()} COP. Los técnicos serán notificados del cambio.`)
    } catch (error) {
      console.error('Error updating client price:', error)
      setError('Error al actualizar el precio')
    }
  }

  // ---- FUNCIONES ESPECÍFICAS PARA TÉCNICOS ----
  const handleMakeOffer = async (requestId: number) => {
    if (!offerPrice) return
    
    if (!canMakeOffer) {
      setError(`Debes esperar ${timeLeft} segundos antes de hacer otra oferta`)
      return
    }
    
    try {
      await serviceRequestService.offerPrice(requestId, { 
        technicianPrice: parseFloat(offerPrice) 
      })
      setOfferPrice('')
      setSelectedRequest(null)
      startThrottle() // Iniciar el período de throttling
      await loadData()
    } catch (error) {
      console.error('Error making offer:', error)
      setError('Error al hacer la oferta')
    }
  }
  const handleAcceptDirectly = async (requestId: number) => {
    try {
      await serviceRequestService.acceptAndSchedule(requestId)
      
      // Remover la solicitud de la lista de pendientes automáticamente
      setPendingRequests(prev => prev.filter(req => req.id !== requestId))
      
      // Recargar solicitudes asignadas para reflejar la nueva asignación
      const myUpdatedRequests = await serviceRequestService.getTechnicianRequests(user!.id)
      setMyRequests(myUpdatedRequests)
      
      console.log('✅ Solicitud aceptada directamente, listas actualizadas automáticamente')
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
      
      // Actualizar la solicitud en la lista de asignadas
      setMyRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'scheduled', scheduledAt: scheduleDate }
            : req
        )
      )
      
      console.log('✅ Solicitud programada, lista actualizada automáticamente')
    } catch (error) {
      console.error('Error scheduling:', error)
      setError('Error al programar el servicio')
    }
  }
  const handleReject = async (requestId: number) => {
    try {
      await serviceRequestService.rejectRequest(requestId)
      
      // Remover la solicitud de la lista de pendientes
      setPendingRequests(prev => prev.filter(req => req.id !== requestId))
      
      console.log('✅ Solicitud rechazada, lista actualizada automáticamente')
    } catch (error) {
      console.error('Error rejecting request:', error)
      setError('Error al rechazar la solicitud')
    }
  }

  const handleReconnect = () => {
    if (isTechnician) {
      technicianNotifications.forceReconnect()
    }
  }

  // Hook para throttling de ofertas de técnicos
  const { canMakeOffer, timeLeft, startThrottle } = useOfferThrottle()

  // ---- RENDERIZADO DE SECCIONES ----
  
  // Alerta de conexión para técnicos
  const renderConnectionAlert = () => {
    // Solo mostrar para técnicos y si está conectando o desconectado
    if (!isTechnician || technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED) {
      return null;
    }

    const isConnecting = technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`mb-4 p-4 rounded-lg border ${
          isConnecting ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isConnecting ? (
              <ArrowPathIcon className="h-5 w-5 text-yellow-600 mr-2 animate-spin" />
            ) : (
              <WifiIcon className="h-5 w-5 text-red-600 mr-2" />
            )}
            <div>
              <h3 className={`font-medium ${isConnecting ? 'text-yellow-800' : 'text-red-800'}`}>
                {isConnecting ? 'Conectando...' : 'Desconectado'}
              </h3>
              <p className="text-sm mt-1 text-gray-600">
                {isConnecting 
                  ? 'Reconectando al servidor. Por favor espere...' 
                  : 'No se pudo conectar al servidor. Los datos pueden estar desactualizados.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleReconnect}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              isConnecting 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Reconectar ahora
          </button>
        </div>
        {isConnecting && technicianNotifications.connectionStatus.nextAttemptIn && (
          <div className="mt-2 text-xs text-gray-500">
            Intento {technicianNotifications.connectionStatus.attempts} de {technicianNotifications.connectionStatus.maxAttempts} • 
            Próximo intento en {Math.round(technicianNotifications.connectionStatus.nextAttemptIn / 1000)} segundos
          </div>
        )}
      </motion.div>
    );
  };

  // Renders específicos para clientes
  const renderClientRequests = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus solicitudes...</p>
          </div>
        </div>
      )
    }

    // Filter requests based on current filter
    const filteredRequests = clientRequests.filter(request => {
      if (requestFilter === 'in-progress') {
        return ['pending', 'offered', 'accepted', 'scheduled'].includes(request.status)
      }
      return true // Show all requests
    })

    return (
      <div className="space-y-6">        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Mis Solicitudes</h2>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nueva Solicitud</span>
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-4 mb-6">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <div className="flex space-x-2">
            <button
              onClick={() => setRequestFilter('in-progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                requestFilter === 'in-progress'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              En Curso ({clientRequests.filter(r => ['pending', 'offered', 'accepted', 'scheduled'].includes(r.status)).length})
            </button>
            <button
              onClick={() => setRequestFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                requestFilter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas ({clientRequests.length})
            </button>
          </div>
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

        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes solicitudes</h3>
            <p className="text-gray-600">Crea una solicitud de servicio para comenzar</p>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nueva Solicitud
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* Renderizado de solicitud para clientes */}
                {/* El contenido específico para cliente iría aquí */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {request.appliance?.name || 'Electrodoméstico no disponible'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Creada: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  
                  <div className="mt-4 text-gray-700">
                    <p>{request.description}</p>
                  </div>                  {/* Acciones específicas para clientes según el estado */}
                  <div className="mt-4">
                    {request.status === 'offered' && request.offers && request.offers.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800 flex items-center gap-2">
                            <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                            Ofertas recibidas ({request.offers.filter(o => o.status === 'pending').length})
                          </h4>
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-1"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            Cancelar solicitud
                          </button>
                        </div>
                          {/* Tu oferta inicial como referencia */}
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Tu oferta inicial</p>
                              <p className="text-lg font-bold text-gray-800">${request.clientPrice.toLocaleString()} COP</p>
                            </div>
                            <button
                              onClick={() => handleUpdateClientPrice(request.id, request.clientPrice)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center gap-1"
                            >
                              <CurrencyDollarIcon className="h-4 w-4" />
                              Actualizar precio
                            </button>
                          </div>
                        </div>
                          {/* Lista de ofertas ordenadas por fecha */}
                        <div className="space-y-3">
                          {request.offers
                            .filter(offer => offer.status === 'pending')
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((offer, index) => (
                              <OfferCard
                                key={offer.id}
                                offer={offer}
                                index={index}
                                requestId={request.id}
                                onAccept={handleAcceptSpecificOffer}
                              />
                            ))
                          }
                        </div>
                        
                        {request.offers.filter(o => o.status === 'pending').length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No hay ofertas pendientes</p>
                          </div>
                        )}
                      </div>
                    )}
                    {request.status === 'scheduled' && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-800 mb-2">Servicio programado:</p>
                        <p className="text-sm text-gray-600">Fecha: <span className="font-medium">{new Date(request.scheduledAt!).toLocaleString()}</span></p>
                        {/* Botón para marcar como completado */}
                        <button
                          onClick={() => handleCompleteService(request.id)}
                          className="mt-3 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Marcar como completado
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Renders específicos para técnicos
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
      <div className="space-y-6">        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Trabajos Disponibles</h2>
          <span className="text-sm text-gray-600">{pendingRequests.length} solicitudes</span>
        </div>{/* Mostrar alerta de conexión */}
        <AnimatePresence>
          {renderConnectionAlert()}
        </AnimatePresence>

        {/* Alerta de nueva solicitud para técnicos */}
        <AnimatePresence>
          {isTechnician && showRecentJobAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center">
                <WrenchScrewdriverIcon className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <h3 className="font-medium text-green-800">¡Nueva solicitud disponible!</h3>
                  <p className="text-sm text-green-600">Revisa las solicitudes pendientes para ver los nuevos trabajos.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecentJobAlert(false)}
                className="text-green-600 hover:text-green-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="grid gap-6">            {pendingRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 relative overflow-hidden"
              >
                {/* Indicador de nueva solicitud */}
                {request.createdAt && (Date.now() - new Date(request.createdAt).getTime() < 5 * 60 * 1000) && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg animate-pulse">
                    NUEVA
                  </div>
                )}
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

  const renderTechnicianJobs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mis Trabajos Asignados</h2>
        <span className="text-sm text-gray-600">{myRequests.length} trabajos</span>
      </div>

      {/* Mostrar alerta de conexión */}
      <AnimatePresence>
        {renderConnectionAlert()}
      </AnimatePresence>

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

  const renderProfile = () => {
    if (isClient) {
      return <ClientProfile />
    } else if (isTechnician) {
      return <TechnicianProfile />
    }
    return null
  }

  // Renderizado según pestaña activa
  const renderContent = (activeTab: string) => {
    if (isClient) {
      switch (activeTab) {
        case 'main':
          return renderClientRequests()
        case 'profile':
          return renderProfile()
        default:
          return renderClientRequests()
      }
    } else if (isTechnician) {
      switch (activeTab) {
        case 'main':
          return renderAvailableJobs()
        case 'my-jobs':
          return renderTechnicianJobs()
        case 'profile':
          return renderProfile()
        default:
          return renderAvailableJobs()
      }
    }
    return null
  }

  // Preparar el contenido del lado derecho según el rol
  const getRightContent = () => {
    if (isClient) {
      // Cliente - Contenido para notificaciones
      return (
        <ClientNotifications 
          notifications={clientNotifications.notifications} 
          isConnected={clientNotifications.isConnected}
          hasUnreadNotifications={clientNotifications.hasUnreadNotifications}
          onDismiss={clientNotifications.dismissNotification}
          onMarkAsRead={clientNotifications.markAsRead}
          onMarkAllAsRead={clientNotifications.markAllAsRead}
          onClear={clientNotifications.clearNotifications}
        />
      )
    } else if (isTechnician) {
      // Técnico - Contenido para notificaciones y estado de conexión
      return (
        <div className="flex items-center space-x-4">
          {/* Indicador de conexión WebSocket */}
          <div className="relative">
            <button
              onClick={() => setShowConnectionDetails(!showConnectionDetails)}
              className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              {technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING ? (
                <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />
              ) : (
                <WifiIcon className={`h-5 w-5 ${technicianNotifications.isConnected ? 'text-green-500' : 'text-red-500'}`} />
              )}
              <span className={`text-sm ${
                technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED 
                  ? 'text-green-600' 
                  : technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED 
                  ? 'Conectado' 
                  : technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING
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
                          technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED 
                            ? 'text-green-600' 
                            : technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {technicianNotifications.connectionStatus.state === ConnectionState.CONNECTED 
                            ? 'Conectado' 
                            : technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING
                            ? 'Conectando...' 
                            : 'Desconectado'
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Intentos:</span>
                        <span className="text-sm font-medium">
                          {technicianNotifications.connectionStatus.attempts} / {technicianNotifications.connectionStatus.maxAttempts}
                        </span>
                      </div>
                      
                      {technicianNotifications.connectionStatus.state === ConnectionState.CONNECTING && technicianNotifications.connectionStatus.nextAttemptIn && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Reconectando en:</span>
                          <span className="text-sm font-medium">
                            {Math.round(technicianNotifications.connectionStatus.nextAttemptIn / 1000)}s
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {technicianNotifications.connectionStatus.state !== ConnectionState.CONNECTED && (
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
                technicianNotifications.hasUnreadNotifications 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BellIcon className="h-6 w-6" />
              {technicianNotifications.hasUnreadNotifications && (
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
                      {technicianNotifications.notifications.length > 0 && (
                        <button
                          onClick={technicianNotifications.clearNotifications}
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
                    {technicianNotifications.notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay notificaciones</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {technicianNotifications.notifications.map((notification, index) => (
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
                                onClick={() => technicianNotifications.dismissNotification(index)}
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

  // Debug effect for development
  useEffect(() => {
    if (import.meta.env.DEV && isTechnician) {
      console.log('🔍 Dashboard Debug - Technician Connection Status:', {
        isConnected: technicianNotifications.isConnected,
        connectionState: technicianNotifications.connectionStatus.state,
        notifications: technicianNotifications.notifications.length,
        userId: user?.id
      });
    }
  }, [
    technicianNotifications.isConnected, 
    technicianNotifications.connectionStatus.state, 
    technicianNotifications.notifications.length,
    isTechnician,
    user?.id
  ]);

  return (
    <>
      <DashboardLayout 
        title={isClient ? "Dashboard Cliente" : "Dashboard Técnico"}
        subtitle={isClient ? "Gestiona tus solicitudes de servicio" : "Gestiona tus trabajos y ofertas"}
        onNavigate={onNavigate}
        rightContent={getRightContent()}
      >
        {({ activeTab }) => renderContent(activeTab)}
      </DashboardLayout>

      {/* Modales específicos para clientes */}
      {isClient && showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nueva Solicitud de Servicio</h2>
              <button 
                onClick={() => setShowNewRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <ServiceRequestForm 
              onSuccess={() => {
                setShowNewRequestModal(false)
                loadData()
              }}
              onError={(error) => setError(error)}
              onCancel={() => setShowNewRequestModal(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Modales específicos para técnicos */}
      {isTechnician && selectedRequest && selectedRequest.status === 'pending' && (
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
              </button>              <button
                onClick={() => handleMakeOffer(selectedRequest.id)}
                disabled={!offerPrice || !canMakeOffer}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  !offerPrice || !canMakeOffer 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {!canMakeOffer 
                  ? `Espera ${timeLeft}s` 
                  : 'Enviar Oferta'
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal para programar (técnicos) */}
      {isTechnician && selectedRequest && selectedRequest.status === 'accepted' && (
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
      )}      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6">
          <MultiOfferDebug 
            clientId={isClient ? user?.id : undefined}
            technicianId={isTechnician ? user?.id : undefined}
          />
        </div>
      )}

      {/* WebSocket Debug Component */}
      <WebSocketDebug />
    </>
  )
}

export default Dashboard
