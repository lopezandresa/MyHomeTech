import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { helpTicketService } from '../../services/helpTicketService';
import { serviceRequestService } from '../../services/serviceRequestService';
import { type CreateHelpTicketRequest, type HelpTicketType, type ServiceRequest }  from '../../types';

interface CreateHelpTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: () => void;
  serviceRequest?: ServiceRequest; // Para pre-seleccionar un servicio específico
  preselectedType?: HelpTicketType; // Para pre-seleccionar el tipo
}

const CreateHelpTicketModal: React.FC<CreateHelpTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
  serviceRequest,
  preselectedType = 'cancel_service' // Por defecto cancelación cuando viene de un servicio
}) => {
  const [formData, setFormData] = useState<CreateHelpTicketRequest>({
    type: preselectedType as HelpTicketType,
    subject: '',
    description: '',
    reason: '',
    serviceRequestId: serviceRequest?.id
  });
  
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUserServiceRequests();
      // Reset form when modal opens
      setFormData({
        type: preselectedType as HelpTicketType,
        subject: getDefaultSubject(preselectedType as HelpTicketType),
        description: '',
        reason: '',
        serviceRequestId: serviceRequest?.id
      });
      setError(null);
    }
  }, [isOpen, serviceRequest?.id, preselectedType]);

  const loadUserServiceRequests = async () => {
    try {
      setIsLoadingServices(true);
      // Cargar solo servicios agendados que pueden ser cancelados/reagendados
      const services = await serviceRequestService.getMyRequestsWithOffers();
      const eligibleServices = services.filter((service: ServiceRequest) => 
        ['scheduled'].includes(service.status)
      );
      setServiceRequests(eligibleServices);
    } catch (error: any) {
      console.error('Error loading service requests:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
  };

  const handleTypeChange = (type: HelpTicketType) => {
    setFormData(prev => ({
      ...prev,
      type,
      subject: getDefaultSubject(type),
      serviceRequestId: ['cancel_service', 'reschedule_service'].includes(type) 
        ? prev.serviceRequestId 
        : undefined
    }));
  };

  const getDefaultSubject = (type: HelpTicketType): string => {
    switch (type) {
      case 'cancel_service':
        return 'Solicitud de cancelación de servicio';
      case 'reschedule_service':
        return 'Solicitud de reagendamiento de servicio';
      case 'technical_issue':
        return 'Problema técnico con la plataforma';
      case 'payment_issue':
        return 'Problema con el pago';
      case 'general_inquiry':
        return 'Consulta general';
      case 'complaint':
        return 'Queja sobre el servicio';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      setError('El asunto es obligatorio');
      return;
    }

    if (!formData.description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    if (['cancel_service', 'reschedule_service'].includes(formData.type) && !formData.serviceRequestId) {
      setError('Debes seleccionar un servicio para este tipo de solicitud');
      return;
    }

    if (formData.type === 'cancel_service' && !formData.reason?.trim()) {
      setError('El motivo de cancelación es obligatorio');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await helpTicketService.createTicket(formData);
      
      // Cerrar modal y notificar éxito
      onClose();
      if (onTicketCreated) {
        onTicketCreated();
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      setError(error.response?.data?.message || 'Error al crear el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: HelpTicketType) => {
    if (type === 'cancel_service') {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
    return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
  };

  const needsServiceSelection = ['cancel_service', 'reschedule_service'].includes(formData.type);
  const needsReason = formData.type === 'cancel_service';

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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Crear Ticket de Ayuda</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información del servicio preseleccionado */}
            {serviceRequest && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Servicio seleccionado:</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">ID:</span> #{serviceRequest.id}</p>
                  <p><span className="font-medium">Electrodoméstico:</span> {serviceRequest.appliance?.name}</p>
                  <p><span className="font-medium">Fecha programada:</span> {
                    serviceRequest.scheduledAt 
                      ? new Date(serviceRequest.scheduledAt).toLocaleString()
                      : new Date(serviceRequest.proposedDateTime).toLocaleString()
                  }</p>
                  <p><span className="font-medium">Estado:</span> {
                    serviceRequest.status === 'scheduled' ? 'Programado' : 
                    serviceRequest.status === 'completed' ? 'Completado' :
                    serviceRequest.status === 'cancelled' ? 'Cancelado' :
                    serviceRequest.status === 'pending' ? 'Pendiente' : serviceRequest.status
                  }</p>
                </div>
              </div>
            )}

            {/* Tipo de ticket */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Solicitud <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'cancel_service', label: 'Cancelar Servicio', description: 'Solicitar cancelación de un servicio agendado' },
                  { value: 'complaint', label: 'Queja', description: 'Reportar problemas con el servicio recibido' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTypeChange(option.value as HelpTicketType)}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      formData.type === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getTypeIcon(option.value as HelpTicketType)}
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de servicio (solo para cancelaciones y reagendamientos) */}
            {needsServiceSelection && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio <span className="text-red-500">*</span>
                </label>
                {isLoadingServices ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : serviceRequests.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No tienes servicios agendados que puedan ser {formData.type === 'cancel_service' ? 'cancelados' : 'reagendados'}.
                    </p>
                  </div>
                ) : (
                  <select
                    name="serviceRequestId"
                    value={formData.serviceRequestId || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona un servicio</option>
                    {serviceRequests.map((service) => (
                      <option key={service.id} value={service.id}>
                        #{service.id} - {service.appliance.name} - {new Date(service.proposedDateTime).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Asunto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asunto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Resumen breve de tu solicitud"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe detalladamente tu solicitud o problema..."
                required
              />
            </div>

            {/* Motivo (solo para cancelaciones) */}
            {needsReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Cancelación <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Explica por qué necesitas cancelar este servicio..."
                  required
                />
                <p className="mt-1 text-xs text-gray-600">
                  Este motivo será revisado por nuestro equipo de administración.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>Crear Ticket</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateHelpTicketModal;