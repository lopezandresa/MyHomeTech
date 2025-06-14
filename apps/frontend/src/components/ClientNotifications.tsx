import React from 'react'
import { Bell, X, Check, Clock, DollarSign, CheckCircle, Calendar, Award, XCircle } from 'lucide-react'

interface ClientNotification {
  serviceRequest: {
    id: number
    description: string
    clientPrice?: number
    technicianPrice?: number
  }
  message: string
  type: 'expired' | 'offer' | 'accepted' | 'scheduled' | 'completed' | 'cancelled'
  timestamp: Date
  id: string
  read: boolean
}

interface ClientNotificationsProps {
  notifications: ClientNotification[]
  isConnected: boolean
  hasUnreadNotifications: boolean
  onDismiss: (index: number) => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClear: () => void
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'expired':
      return <Clock className="w-5 h-5 text-orange-500" />
    case 'offer':
      return <DollarSign className="w-5 h-5 text-green-500" />
    case 'accepted':
      return <CheckCircle className="w-5 h-5 text-blue-500" />
    case 'scheduled':
      return <Calendar className="w-5 h-5 text-purple-500" />
    case 'completed':
      return <Award className="w-5 h-5 text-green-600" />
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-red-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-500" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'expired':
      return 'border-l-orange-500 bg-orange-50'
    case 'offer':
      return 'border-l-green-500 bg-green-50'
    case 'accepted':
      return 'border-l-blue-500 bg-blue-50'
    case 'scheduled':
      return 'border-l-purple-500 bg-purple-50'
    case 'completed':
      return 'border-l-green-500 bg-green-50'
    case 'cancelled':
      return 'border-l-red-500 bg-red-50'
    default:
      return 'border-l-gray-500 bg-gray-50'
  }
}

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${days}d`
}

export const ClientNotifications: React.FC<ClientNotificationsProps> = ({
  notifications,
  isConnected,
  onDismiss,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <Bell className="w-6 h-6" />
        
        {/* Indicador de conexión */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        
        {/* Contador de notificaciones no leídas */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-red-600">({unreadCount} nuevas)</span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {/* Estado de conexión */}
                <div className="flex items-center space-x-1 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Acciones */}
            {notifications.length > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={onClear}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Limpiar todas
                </button>
              </div>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'bg-opacity-75' : 'bg-opacity-25'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          Solicitud #{notification.serviceRequest.id}: {notification.serviceRequest.description}
                        </p>
                        
                        {notification.type === 'offer' && notification.serviceRequest.technicianPrice && (
                          <p className="text-xs text-green-600 mt-1">
                            Precio ofertado: ${notification.serviceRequest.technicianPrice.toLocaleString()}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                                title="Marcar como leída"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => onDismiss(index)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                              title="Eliminar notificación"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}