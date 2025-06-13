import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ClientNotification {
  serviceRequest: any
  message: string
  type: 'expired' | 'offer' | 'accepted' | 'scheduled' | 'completed' | 'cancelled'
  timestamp: Date
  id: string
  read: boolean
}

interface ClientNotificationPanelProps {
  notifications: ClientNotification[]
  isConnected: boolean
  hasUnreadNotifications: boolean
  onDismiss: (index: number) => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClear: () => void
}

export const ClientNotificationPanel: React.FC<ClientNotificationPanelProps> = ({
  notifications,
  isConnected,
  hasUnreadNotifications,
  onDismiss,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expired':
        return '⏰'
      case 'offer':
        return '💰'
      case 'accepted':
        return '✅'
      case 'scheduled':
        return '📅'
      case 'completed':
        return '🎉'
      case 'cancelled':
        return '❌'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'expired':
        return 'border-red-200 bg-red-50'
      case 'offer':
        return 'border-blue-200 bg-blue-50'
      case 'accepted':
        return 'border-green-200 bg-green-50'
      case 'scheduled':
        return 'border-purple-200 bg-purple-50'
      case 'completed':
        return 'border-emerald-200 bg-emerald-50'
      case 'cancelled':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'expired':
        return 'Expirada'
      case 'offer':
        return 'Nueva Oferta'
      case 'accepted':
        return 'Aceptada'
      case 'scheduled':
        return 'Programada'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      default:
        return 'Actualización'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-lg font-semibold text-gray-800">Notificaciones</div>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          {hasUnreadNotifications && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Nuevas
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {notifications.length > 0 && hasUnreadNotifications && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Marcar todas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-gray-500 text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 transition-all duration-200 hover:bg-gray-50 ${
                  !notification.read ? 'bg-blue-25 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getNotificationColor(notification.type)
                        }`}>
                          {getTypeText(notification.type)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-800 mb-1">{notification.message}</p>
                      
                      {notification.serviceRequest && (
                        <p className="text-xs text-gray-500 truncate">
                          Solicitud #{notification.serviceRequest.id} - {notification.serviceRequest.appliance?.name || 'Electrodoméstico'}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDismiss(index)
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </div>
    </div>
  )
}