import React from 'react'
import { FiClock, FiCheckCircle, FiCalendar, FiXCircle, FiAlertCircle } from 'react-icons/fi'

interface ServiceRequestData {
  month: string
  pending: number
  scheduled: number
  completed: number
  cancelled: number
}

interface ServiceRequestChartProps {
  data: ServiceRequestData[]
  totals: {
    pending: number
    scheduled: number
    completed: number
    cancelled: number
  }
}

/**
 * Componente de gráfico de solicitudes de servicio para el panel de administrador
 * Muestra el estado de las solicitudes por mes según el flujo real de MyHomeTech:
 * PENDING → SCHEDULED → COMPLETED (o CANCELLED)
 */
const ServiceRequestChart: React.FC<ServiceRequestChartProps> = ({ 
  data, 
  totals 
}) => {
  // Calcular el máximo total de solicitudes por mes para el escalado
  const maxTotal = Math.max(...data.map(d => d.pending + d.scheduled + d.completed + d.cancelled))
  
  // Calcular el total de todas las solicitudes
  const totalRequests = totals.pending + totals.scheduled + totals.completed + totals.cancelled

  // Calcular porcentajes para las métricas
  const completionRate = totalRequests > 0 ? (totals.completed / totalRequests) * 100 : 0
  const pendingRate = totalRequests > 0 ? (totals.pending / totalRequests) * 100 : 0
  const scheduledRate = totalRequests > 0 ? (totals.scheduled / totalRequests) * 100 : 0

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Servicio</h3>
          <p className="text-sm text-gray-500">Flujo de estados por mes • MyHomeTech</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total solicitudes</p>
        </div>
      </div>

      {/* Métricas principales con los estados reales */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <FiClock className="h-5 w-5 text-yellow-600" />
            <div className="ml-2">
              <p className="text-sm font-medium text-yellow-800">Pendientes</p>
              <p className="text-lg font-bold text-yellow-900">{totals.pending}</p>
              <p className="text-xs text-yellow-700">{pendingRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <FiCalendar className="h-5 w-5 text-blue-600" />
            <div className="ml-2">
              <p className="text-sm font-medium text-blue-800">Programadas</p>
              <p className="text-lg font-bold text-blue-900">{totals.scheduled}</p>
              <p className="text-xs text-blue-700">{scheduledRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center">
            <FiCheckCircle className="h-5 w-5 text-green-600" />
            <div className="ml-2">
              <p className="text-sm font-medium text-green-800">Completadas</p>
              <p className="text-lg font-bold text-green-900">{totals.completed}</p>
              <p className="text-xs text-green-700">{completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="flex items-center">
            <FiXCircle className="h-5 w-5 text-red-600" />
            <div className="ml-2">
              <p className="text-sm font-medium text-red-800">Canceladas</p>
              <p className="text-lg font-bold text-red-900">{totals.cancelled}</p>
              <p className="text-xs text-red-700">
                {totalRequests > 0 ? ((totals.cancelled / totalRequests) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de barras apiladas */}
      <div className="mt-6">
        <div className="flex items-end justify-between h-64 space-x-2">
          {data.map((item, index) => {
            const total = item.pending + item.scheduled + item.completed + item.cancelled
            const height = total > 0 && maxTotal > 0 ? (total / maxTotal) * 200 : 0
            
            // Calcular alturas proporcionales para cada segmento
            const completedHeight = total > 0 ? (item.completed / total) * height : 0
            const scheduledHeight = total > 0 ? (item.scheduled / total) * height : 0
            const pendingHeight = total > 0 ? (item.pending / total) * height : 0
            const cancelledHeight = total > 0 ? (item.cancelled / total) * height : 0
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-8 flex flex-col-reverse">
                  {/* Barras apiladas desde abajo hacia arriba */}
                  {completedHeight > 0 && (
                    <div
                      className="bg-green-500 w-full hover:bg-green-600 transition-colors"
                      style={{ height: `${completedHeight}px` }}
                      title={`Completadas: ${item.completed}`}
                    />
                  )}
                  {scheduledHeight > 0 && (
                    <div
                      className="bg-blue-500 w-full hover:bg-blue-600 transition-colors"
                      style={{ height: `${scheduledHeight}px` }}
                      title={`Programadas: ${item.scheduled}`}
                    />
                  )}
                  {pendingHeight > 0 && (
                    <div
                      className="bg-yellow-500 w-full hover:bg-yellow-600 transition-colors"
                      style={{ height: `${pendingHeight}px` }}
                      title={`Pendientes: ${item.pending}`}
                    />
                  )}
                  {cancelledHeight > 0 && (
                    <div
                      className="bg-red-500 w-full rounded-t hover:bg-red-600 transition-colors"
                      style={{ height: `${cancelledHeight}px` }}
                      title={`Canceladas: ${item.cancelled}`}
                    />
                  )}
                </div>
                
                {/* Etiqueta del mes */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {item.month.substring(0, 3)}
                </div>
                
                {/* Total del mes */}
                <div className="mt-1 text-xs text-gray-700 text-center font-medium">
                  {total}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leyenda con estados reales de MyHomeTech */}
      <div className="mt-6 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span className="text-gray-600">Pendientes</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span className="text-gray-600">Programadas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-gray-600">Completadas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-gray-600">Canceladas</span>
        </div>
      </div>

      {/* Estadísticas de rendimiento del sistema */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FiCheckCircle className="h-4 w-4 text-green-500 mr-1" />
          </div>
          <p className="text-lg font-semibold text-green-600">
            {completionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">Tasa de Completación</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FiCalendar className="h-4 w-4 text-blue-500 mr-1" />
          </div>
          <p className="text-lg font-semibold text-blue-600">
            {scheduledRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">Tasa de Programación</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FiClock className="h-4 w-4 text-yellow-500 mr-1" />
          </div>
          <p className="text-lg font-semibold text-orange-600">
            {pendingRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">Solicitudes Pendientes</p>
        </div>
      </div>

      {/* Información del flujo de trabajo */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <FiAlertCircle className="h-4 w-4 text-gray-500 mr-2" />
          <h4 className="text-sm font-medium text-gray-700">Flujo de Estados</h4>
        </div>
        <p className="text-xs text-gray-600">
          <span className="font-medium">PENDING</span> → Cliente crea solicitud → 
          <span className="font-medium"> SCHEDULED</span> → Técnico acepta → 
          <span className="font-medium"> COMPLETED</span> → Servicio finalizado
        </p>
      </div>

      {/* Estado vacío */}
      {data.length === 0 && (
        <div className="mt-6 text-center py-8">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos de solicitudes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Las estadísticas aparecerán cuando haya solicitudes de servicio registradas.
          </p>
        </div>
      )}
    </div>
  )
}

export default ServiceRequestChart