import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { helpTicketService } from '../../services/helpTicketService'
import { formatDate } from '../../utils/dateUtils'

interface AdminHelpTicketsProps {}

const AdminHelpTickets: React.FC<AdminHelpTicketsProps> = () => {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const data = await helpTicketService.getAllTickets()
      setTickets(data)
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (ticketId: number, status: 'resolved' | 'rejected') => {
    try {
      await helpTicketService.updateTicketStatus(ticketId, status)
      await loadTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status })
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  const getFilteredTickets = () => {
    if (filter === 'all') return tickets
    return tickets.filter(ticket => ticket.status === filter)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />
      case 'resolved': return <CheckCircleIcon className="h-4 w-4" />
      case 'rejected': return <XMarkIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Tickets de Ayuda</h2>
        <div className="flex space-x-2">
          {(['all', 'pending', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todos' :
               status === 'pending' ? 'Pendientes' :
               'Resueltos'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          {getFilteredTickets().map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600">
                    {ticket.user.firstName} {ticket.user.firstLastName}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span>
                      {ticket.status === 'pending' ? 'Pendiente' :
                       ticket.status === 'resolved' ? 'Resuelto' :
                       ticket.status === 'rejected' ? 'Rechazado' :
                       'Pendiente'}
                    </span>
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {ticket.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Creado: {formatDate(ticket.created_at)}</span>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {getFilteredTickets().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay tickets para mostrar
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Usuario: {selectedTicket.user.firstName} {selectedTicket.user.firstLastName} ({selectedTicket.user.email})
                  </p>
                </div>
                
                {selectedTicket.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Resolver
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'rejected')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                  {getStatusIcon(selectedTicket.status)}
                  <span>
                    {selectedTicket.status === 'pending' ? 'Pendiente' :
                     selectedTicket.status === 'resolved' ? 'Resuelto' :
                     selectedTicket.status === 'rejected' ? 'Rechazado' :
                     'Pendiente'}
                  </span>
                </span>
                <span>Creado: {formatDate(selectedTicket.created_at)}</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Descripción:</h4>
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminHelpTickets