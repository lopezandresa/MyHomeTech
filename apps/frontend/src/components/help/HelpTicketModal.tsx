import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifebuoyIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { helpTicketService } from '../../services/helpTicketService';
import type { HelpTicket, HelpTicketStatus } from '../../types';

interface HelpTicketListProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpTicketList: React.FC<HelpTicketListProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ticketData = await helpTicketService.getMyTickets();
      setTickets(ticketData);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      setError('Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: HelpTicketStatus) => {
    switch (status) {
      case 'approved':
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'in_review':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'pending':
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: HelpTicketStatus) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_review':
        return 'En Revisión';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'resolved':
        return 'Resuelto';
      default:
        return status;
    }
  };

  const getStatusColor = (status: HelpTicketStatus) => {
    switch (status) {
      case 'approved':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cancel_service':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'reschedule_service':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'technical_issue':
        return <LifebuoyIcon className="h-4 w-4 text-orange-500" />;
      case 'complaint':
        return <ChatBubbleLeftRightIcon className="h-4 w-4 text-red-500" />;
      case 'general_inquiry':
      default:
        return <QuestionMarkCircleIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'cancel_service':
        return 'Cancelación';
      case 'reschedule_service':
        return 'Reagendamiento';
      case 'technical_issue':
        return 'Problema Técnico';
      case 'payment_issue':
        return 'Problema de Pago';
      case 'general_inquiry':
        return 'Consulta General';
      case 'complaint':
        return 'Queja';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <LifebuoyIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mis Tickets de Ayuda</h2>
                <p className="text-sm text-gray-600">
                  Consulta el estado de tus solicitudes de ayuda
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 px-6">
                <LifebuoyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes tickets de ayuda
                </h3>
                <p className="text-gray-600">
                  Aún no has creado ningún ticket de ayuda. Crea uno si necesitas asistencia.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(ticket.type)}
                          <h3 className="font-semibold text-gray-900">
                            #{ticket.id} - {ticket.subject}
                          </h3>
                        </div>

                        <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                          {ticket.description}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Creado: {formatDate(ticket.createdAt)}</span>
                          <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusText(ticket.status)}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-medium">
                            {getTypeText(ticket.type)}
                          </span>
                        </div>

                        {/* Respuesta del administrador */}
                        {ticket.adminResponse && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                Respuesta del Administrador:
                              </span>
                            </div>
                            <p className="text-sm text-blue-800">{ticket.adminResponse}</p>
                            {ticket.resolvedAt && (
                              <p className="text-xs text-blue-600 mt-1">
                                Respondido el {formatDate(ticket.resolvedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Información del servicio relacionado */}
                        {ticket.serviceRequest && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <span className="font-medium">Servicio relacionado:</span> #{ticket.serviceRequest.id} - {ticket.serviceRequest.appliance?.name}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center ml-4">
                        {getStatusIcon(ticket.status)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HelpTicketList;