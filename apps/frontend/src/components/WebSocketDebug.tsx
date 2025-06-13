import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRealTimeServiceRequests } from '../hooks/useRealTimeServiceRequests'
import { useRealTimeClientNotifications } from '../hooks/useRealTimeClientNotifications'
import webSocketService from '../services/webSocketService'

const WebSocketDebug: React.FC = () => {
  const { user } = useAuth()
  const [showDebug, setShowDebug] = useState(false)
  
  const technicianNotifications = useRealTimeServiceRequests(
    user?.role === 'technician' ? user?.id : undefined
  )
  
  const clientNotifications = useRealTimeClientNotifications(
    user?.role === 'client' ? user?.id : undefined
  )

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm z-50"
      >
        Debug WS
      </button>
    )
  }

  const debugInfo = () => {
    webSocketService.debugConnectionStatus()
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">WebSocket Debug</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Usuario:</strong> {user?.role} (ID: {user?.id})
        </div>
        
        {user?.role === 'technician' && (
          <div>
            <strong>Técnico:</strong>
            <div className="ml-2">
              <div>Conectado: {technicianNotifications.isConnected ? '✅' : '❌'}</div>
              <div>Estado: {technicianNotifications.connectionStatus.state}</div>
              <div>Intentos: {technicianNotifications.connectionStatus.attempts}</div>
              <div>Notificaciones: {technicianNotifications.notifications.length}</div>
            </div>
          </div>
        )}
        
        {user?.role === 'client' && (
          <div>
            <strong>Cliente:</strong>
            <div className="ml-2">
              <div>Conectado: {clientNotifications.isConnected ? '✅' : '❌'}</div>
              <div>Notificaciones: {clientNotifications.notifications.length}</div>
              <div>No leídas: {clientNotifications.hasUnreadNotifications ? 'Sí' : 'No'}</div>
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <button
            onClick={debugInfo}
            className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2"
          >
            Log Debug
          </button>
          
          {user?.role === 'technician' && (
            <button
              onClick={technicianNotifications.forceReconnect}
              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
            >
              Reconectar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default WebSocketDebug
