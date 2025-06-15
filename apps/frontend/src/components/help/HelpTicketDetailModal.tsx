import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { helpTicketService, helpTicketUtils } from '../../services/helpTicketService';
import type { HelpTicket, RespondHelpTicketRequest, HelpTicketStatus } from '../../types';

interface HelpTicketDetailModalProps {
  isOpen: boolean;
  ticket: HelpTicket;
  onClose: () => void;
  onTicketUpdated: () => void;
  isAdmin?: boolean;
}

const HelpTicketDetailModal: React.FC<HelpTicketDetailModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onTicketUpdated,
  isAdmin = false
}) => {
  const [isResponding, setIsResponding] = useState(false);
  const [response, setResponse] = useState<RespondHelpTicketRequest>({
    status: 'approved',
    adminResponse: '',
    adminNotes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response.adminResponse.trim()) {
      setError('La respuesta es obligatoria');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await helpTicketService.respondToTicket(ticket.id, response);
      onTicketUpdated();
    } catch (error: any) {
      console.error('Error responding to ticket:', error);
      setError(error.response?.data?.message || 'Error al responder al ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: HelpTicketStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'in_review':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getResponseTemplate = (status: HelpTicketStatus, ticketType: string) => {
    if (status === 'approved' && ticketType === 'cancel_service') {
      return 'Tu solicitud de cancelación ha sido aprobada. El servicio ha sido cancelado exitosamente y no se aplicarán penalizaciones. Te notificaremos por email con los detalles de la cancelación.';
    } else if (status === 'rejected' && ticketType === 'cancel_service') {
      return 'Lamentamos informarte que tu solicitud de cancelación no puede ser aprobada en este momento. Por favor, revisa los términos y condiciones o contacta a nuestro equipo de soporte para más información.';
    } else if (status === 'approved') {
      return 'Tu solicitud ha sido aprobada y procesada exitosamente. Nuestro equipo tomará las acciones correspondientes.';
    } else if (status === 'rejected') {
      return 'Tu solicitud ha sido revisada pero no puede ser aprobada en este momento. Por favor, proporciona información adicional o contacta a nuestro equipo de soporte.';
    }
    return '';
  };

  const handleStatusChange = (newStatus: HelpTicketStatus) => {
    setResponse(prev => ({
      ...prev,
      status: newStatus,
      adminResponse: getResponseTemplate(newStatus, ticket.type)
    }));
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
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {getStatusIcon(ticket.status)}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ticket #{ticket.id}
                </h2>
                <p className="text-sm text-gray-600">{ticket.subject}</p>
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
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información principal del ticket */}
              <div className="lg:col-span-2 space-y-6">
                {/* Detalles básicos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Información del Ticket</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${helpTicketUtils.getTypeBadgeColor(ticket.type)}`}>
                        {helpTicketUtils.getTypeText(ticket.type)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${helpTicketUtils.getStatusBadgeColor(ticket.status)}`}>
                        {helpTicketUtils.getStatusText(ticket.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Creado:</span>
                      <span className="ml-2 text-gray-900">{helpTicketUtils.formatDate(ticket.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Actualizado:</span>
                      <span className="ml-2 text-gray-900">{helpTicketUtils.formatDate(ticket.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Usuario */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Usuario
                  </h3>
                  <div className="flex items-center space-x-3">
                    {ticket.user?.profilePhotoUrl ? (
                      <img
                        src={ticket.user.profilePhotoUrl}
                        alt={`${ticket.user.firstName} ${ticket.user.firstLastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {ticket.user?.firstName} {ticket.user?.firstLastName}
                      </p>
                      <p className="text-sm text-gray-600">{ticket.user?.email}</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.user?.role === 'client' ? 'bg-blue-100 text-blue-800' :
                        ticket.user?.role === 'technician' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {ticket.user?.role === 'client' ? 'Cliente' :
                         ticket.user?.role === 'technician' ? 'Técnico' : 'Administrador'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Servicio relacionado */}
                {ticket.serviceRequest && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Servicio Relacionado</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">ID:</span>
                        <span className="ml-2 text-gray-900">#{ticket.serviceRequest.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Electrodoméstico:</span>
                        <span className="ml-2 text-gray-900">{ticket.serviceRequest.appliance?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Fecha propuesta:</span>
                        <span className="ml-2 text-gray-900">
                          {helpTicketUtils.formatDate(ticket.serviceRequest.proposedDateTime)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Estado del servicio:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.serviceRequest.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          ticket.serviceRequest.status === 'completed' ? 'bg-green-100 text-green-800' :
                          ticket.serviceRequest.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.serviceRequest.status === 'scheduled' ? 'Agendado' :
                           ticket.serviceRequest.status === 'completed' ? 'Completado' :
                           ticket.serviceRequest.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Descripción */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {/* Motivo (para cancelaciones) */}
                {ticket.reason && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Motivo</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.reason}</p>
                  </div>
                )}

                {/* Respuesta del admin */}
                {ticket.adminResponse && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Respuesta del Administrador</h3>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.adminResponse}</p>
                    {ticket.resolvedAt && (
                      <p className="text-sm text-gray-600 mt-2">
                        Respondido el {helpTicketUtils.formatDate(ticket.resolvedAt)}
                        {ticket.resolvedByAdmin && ` por ${ticket.resolvedByAdmin.firstName} ${ticket.resolvedByAdmin.firstLastName}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Panel lateral - Solo para administradores */}
              {isAdmin && (
                <div className="space-y-4">
                  {!ticket.isResolved && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Responder Ticket</h3>
                      
                      {!isResponding ? (
                        <button
                          onClick={() => setIsResponding(true)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Responder
                        </button>
                      ) : (
                        <form onSubmit={handleResponseSubmit} className="space-y-4">
                          {/* Estado */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Decisión
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusChange('approved')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  response.status === 'approved'
                                    ? 'bg-green-100 text-green-800 border-green-300'
                                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                } border`}
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange('rejected')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  response.status === 'rejected'
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                } border`}
                              >
                                Rechazar
                              </button>
                            </div>
                          </div>

                          {/* Respuesta */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Respuesta al usuario
                            </label>
                            <textarea
                              value={response.adminResponse}
                              onChange={(e) => setResponse(prev => ({ ...prev, adminResponse: e.target.value }))}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Escribe la respuesta que verá el usuario..."
                              required
                            />
                          </div>

                          {/* Notas internas */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Notas internas (opcional)
                            </label>
                            <textarea
                              value={response.adminNotes}
                              onChange={(e) => setResponse(prev => ({ ...prev, adminNotes: e.target.value }))}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Notas para otros administradores..."
                            />
                          </div>

                          {/* Error */}
                          {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-800 text-sm">{error}</p>
                            </div>
                          )}

                          {/* Botones */}
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsResponding(false);
                                setError(null);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                'Enviar'
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Información Adicional</h3>
                    <div className="space-y-2 text-sm">
                      {ticket.assignedAdmin && (
                        <div>
                          <span className="text-gray-600">Asignado a:</span>
                          <span className="ml-2 text-gray-900">
                            {ticket.assignedAdmin.firstName} {ticket.assignedAdmin.firstLastName}
                          </span>
                        </div>
                      )}
                      {ticket.adminNotes && (
                        <div>
                          <span className="text-gray-600 block mb-1">Notas internas:</span>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                            {ticket.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HelpTicketDetailModal;