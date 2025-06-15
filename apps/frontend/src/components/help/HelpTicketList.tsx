import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LifebuoyIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { helpTicketService, helpTicketUtils } from '../../services/helpTicketService';
import type { HelpTicket, HelpTicketStatus, HelpTicketType } from '../../types';
import CreateHelpTicketModal from './CreateHelpTicketModal';
import HelpTicketDetailModal from './HelpTicketDetailModal';

interface HelpTicketListProps {
  isAdmin?: boolean;
}

const HelpTicketList: React.FC<HelpTicketListProps> = ({ isAdmin = false }) => {
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<HelpTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<HelpTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<HelpTicketStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<HelpTicketType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTickets();
  }, [isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [tickets, statusFilter, typeFilter, searchTerm]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const ticketData = isAdmin 
        ? await helpTicketService.getAllTickets()
        : await helpTicketService.getMyTickets();
      
      setTickets(ticketData);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      setError(error.response?.data?.message || 'Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.type === typeFilter);
    }

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term) ||
        (isAdmin && ticket.user && (
          `${ticket.user.firstName} ${ticket.user.firstLastName}`.toLowerCase().includes(term) ||
          ticket.user.email.toLowerCase().includes(term)
        ))
      );
    }

    setFilteredTickets(filtered);
  };

  const handleTicketClick = (ticket: HelpTicket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleCreateTicket = () => {
    setShowCreateModal(true);
  };

  const handleTicketCreated = () => {
    setShowCreateModal(false);
    loadTickets();
  };

  const handleTicketUpdated = () => {
    setShowDetailModal(false);
    loadTickets();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LifebuoyIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'Gestión de Tickets' : 'Mis Tickets de Ayuda'}
            </h1>
            <p className="text-sm text-gray-600">
              {isAdmin 
                ? 'Administra todas las solicitudes de ayuda del sistema'
                : 'Gestiona tus solicitudes de ayuda y soporte'
              }
            </p>
          </div>
        </div>
        
        {!isAdmin && (
          <button
            onClick={handleCreateTicket}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Crear Ticket</span>
          </button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro por estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as HelpTicketStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_review">En Revisión</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
            <option value="resolved">Resuelto</option>
          </select>

          {/* Filtro por tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as HelpTicketType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="cancel_service">Cancelar Servicio</option>
            <option value="reschedule_service">Reagendar Servicio</option>
            <option value="technical_issue">Problema Técnico</option>
            <option value="general_inquiry">Consulta General</option>
            <option value="complaint">Queja</option>
          </select>

          {/* Botón limpiar filtros */}
          <button
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setSearchTerm('');
            }}
            className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            Limpiar
          </button>
        </div>

        {/* Resumen de filtros */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredTickets.length} de {tickets.length} tickets
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lista de tickets */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <LifebuoyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tickets de ayuda
            </h3>
            <p className="text-gray-600">
              {isAdmin 
                ? 'No se encontraron tickets que coincidan con los filtros aplicados.'
                : 'Aún no has creado ningún ticket de ayuda. Crea uno si necesitas asistencia.'
              }
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTicketClick(ticket)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      #{ticket.id} - {ticket.subject}
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{helpTicketUtils.getRelativeTime(ticket.createdAt)}</span>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{ticket.user?.firstName} {ticket.user?.firstLastName}</span>
                      </div>
                    )}

                    {ticket.serviceRequest && (
                      <div>
                        <span className="text-blue-600">Servicio #{ticket.serviceRequest.id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${helpTicketUtils.getStatusBadgeColor(ticket.status)}`}>
                    {helpTicketUtils.getStatusText(ticket.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${helpTicketUtils.getTypeBadgeColor(ticket.type)}`}>
                    {helpTicketUtils.getTypeText(ticket.type)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateHelpTicketModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}

      {showDetailModal && selectedTicket && (
        <HelpTicketDetailModal
          isOpen={showDetailModal}
          ticket={selectedTicket}
          onClose={() => setShowDetailModal(false)}
          onTicketUpdated={handleTicketUpdated}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default HelpTicketList;