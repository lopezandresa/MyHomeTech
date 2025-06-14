import React from 'react'
import { useRealTimeServiceRequests } from '../../hooks/useRealTimeServiceRequests'
import { useAuth } from '../../contexts/AuthContext'

interface RealTimeMetricsProps {
  className?: string
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const { 
    connectionStatus, 
    performanceMetrics, 
    isConnected,
    debugConnection 
  } = useRealTimeServiceRequests(user?.role === 'technician' ? user.id : undefined)

  const getConnectionIcon = () => {
    if (!isConnected) return '🔴'
    switch (connectionStatus.quality) {
      case 'excellent': return '🟢'
      case 'good': return '🟡'
      case 'poor': return '🟠'
      default: return '🔴'
    }
  }

  const getConnectionText = () => {
    if (!isConnected) return 'Desconectado'
    switch (connectionStatus.quality) {
      case 'excellent': return 'Excelente'
      case 'good': return 'Buena'
      case 'poor': return 'Lenta'
      default: return 'Desconectado'
    }
  }

  const getLatencyColor = (latency: number) => {
    if (latency <= 50) return 'text-green-600'
    if (latency <= 150) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (user?.role !== 'technician') return null

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        ⚡ Métricas en Tiempo Real
        <button
          onClick={debugConnection}
          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
          title="Debug conexión"
        >
          🔧
        </button>
      </h3>
      
      <div className="space-y-3">
        {/* Estado de Conexión */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getConnectionIcon()}</span>
            <span className="text-sm text-gray-600">Conexión</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{getConnectionText()}</div>
            {connectionStatus.socketId && (
              <div className="text-xs text-gray-500">
                ID: {connectionStatus.socketId.slice(-6)}
              </div>
            )}
          </div>
        </div>

        {/* Latencia Actual */}
        {isConnected && connectionStatus.latency > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚡</span>
              <span className="text-sm text-gray-600">Latencia</span>
            </div>
            <div className={`text-sm font-medium ${getLatencyColor(connectionStatus.latency)}`}>
              {connectionStatus.latency}ms
            </div>
          </div>
        )}

        {/* Métricas de Rendimiento */}
        {performanceMetrics.totalEvents > 0 && (
          <>
            <hr className="border-gray-200" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Promedio</span>
                <span className={`text-sm font-medium ${getLatencyColor(performanceMetrics.averageLatency)}`}>
                  {performanceMetrics.averageLatency}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mejor</span>
                <span className="text-sm font-medium text-green-600">
                  {performanceMetrics.minLatency}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peor</span>
                <span className="text-sm font-medium text-red-600">
                  {performanceMetrics.maxLatency}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Eventos</span>
                <span className="text-sm font-medium text-blue-600">
                  {performanceMetrics.totalEvents}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Eventos Pendientes */}
        {connectionStatus.pendingEvents > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📤</span>
              <span className="text-sm text-gray-600">Pendientes</span>
            </div>
            <span className="text-sm font-medium text-orange-600">
              {connectionStatus.pendingEvents}
            </span>
          </div>
        )}

        {/* Intentos de Reconexión */}
        {!isConnected && connectionStatus.attempts > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔄</span>
              <span className="text-sm text-gray-600">Reconectando</span>
            </div>
            <span className="text-sm font-medium text-blue-600">
              {connectionStatus.attempts}/{connectionStatus.maxAttempts}
            </span>
          </div>
        )}

        {/* Indicador de Ultra-Velocidad */}
        {isConnected && connectionStatus.latency <= 50 && (
          <div className="flex items-center justify-center p-2 bg-green-50 rounded-md">
            <span className="text-xs font-medium text-green-700">
              🚀 Velocidad Ultra-Rápida Activa
            </span>
          </div>
        )}
      </div>
    </div>
  )
}