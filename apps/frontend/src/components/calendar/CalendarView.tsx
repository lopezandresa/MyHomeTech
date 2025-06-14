import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, UserIcon, HomeIcon } from '@heroicons/react/24/outline'
import serviceRequestService from '../../services/serviceRequestService'
import { useAuth } from '../../contexts/AuthContext'
import type { ServiceRequest, CalendarEvent } from '../../types'

interface CalendarViewProps {
  userType: 'client' | 'technician'
}

export const CalendarView: React.FC<CalendarViewProps> = ({ userType }) => {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendarData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Obtener datos del mes actual
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)

      let requests: ServiceRequest[] = []
      
      if (userType === 'technician') {
        requests = await serviceRequestService.getTechnicianCalendar(user.id, startOfMonth, endOfMonth)
      } else {
        requests = await serviceRequestService.getClientCalendar(user.id, startOfMonth, endOfMonth)
      }

      const calendarEvents = serviceRequestService.convertToCalendarEvents(requests)
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      setError('Error al cargar el calendario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendarData()
  }, [user, selectedDate, userType])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programado'
      case 'completed':
        return 'Completado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  // Obtener eventos del día seleccionado
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return events.filter(event => {
      const eventDate = new Date(event.start).toDateString()
      return eventDate === dateStr
    })
  }

  // Generar días del mes
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchCalendarData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const days = getDaysInMonth()
  const monthYear = selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header del calendario */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 capitalize">
          <CalendarIcon className="h-6 w-6 inline mr-2" />
          Mi Calendario - {monthYear}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
          >
            Hoy
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-24 border-r border-b border-gray-100"></div>
          }

          const dayEvents = getEventsForDate(day)
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div
              key={day.toISOString()}
              className={`h-24 border-r border-b border-gray-100 p-1 ${
                isToday ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                {day.getDate()}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                    title={event.title}
                  >
                    {formatTime(event.start)} - {event.serviceRequest.appliance.name}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} más
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lista de próximos servicios */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Próximos Servicios
        </h3>
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No tienes servicios programados este mes
          </p>
        ) : (
          <div className="space-y-3">
            {events
              .filter(event => new Date(event.start) > new Date())
              .slice(0, 5)
              .map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {event.serviceRequest.appliance.name}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {formatDate(event.start)} - {formatTime(event.start)}
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          {userType === 'technician' 
                            ? `${event.serviceRequest.client.firstName} ${event.serviceRequest.client.firstLastName}`
                            : event.serviceRequest.technician
                              ? `${event.serviceRequest.technician.firstName} ${event.serviceRequest.technician.firstLastName}`
                              : 'Técnico asignado'
                          }
                        </div>
                        <div className="flex items-center">
                          <HomeIcon className="h-4 w-4 mr-2" />
                          {event.serviceRequest.address.fullAddress}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.serviceRequest.status)}`}>
                      {getStatusText(event.serviceRequest.status)}
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}