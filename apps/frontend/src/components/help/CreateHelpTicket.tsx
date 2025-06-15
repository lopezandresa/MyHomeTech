import React, { useState } from 'react';
import { helpTicketService } from '../../services/helpTicketService';
import { Send, AlertCircle } from 'lucide-react';
import { HelpTicketType, type CreateHelpTicketRequest } from '../../types';

interface CreateHelpTicketProps {
  onSuccess?: () => void;
  compact?: boolean;
}

const CreateHelpTicket: React.FC<CreateHelpTicketProps> = ({ onSuccess, compact = false }) => {
  const [formData, setFormData] = useState<CreateHelpTicketRequest>({
    type: HelpTicketType.GENERAL_INQUIRY,
    subject: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await helpTicketService.createTicket(formData);
      setSuccess(true);
      setFormData({ 
        type: HelpTicketType.GENERAL_INQUIRY,
        subject: '', 
        description: '' 
      });
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'type' ? value as HelpTicketType : value
    }));
  };

  if (success) {
    return (
      <div className={`${compact ? 'p-4' : 'p-6'} text-center`}>
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ¡Ticket creado exitosamente!
        </h3>
        <p className="text-gray-600">
          Hemos recibido tu solicitud y te contactaremos pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-4' : 'space-y-6'}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Consulta *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={HelpTicketType.GENERAL_INQUIRY}>Consulta General</option>
          <option value={HelpTicketType.TECHNICAL_ISSUE}>Problema Técnico</option>
          <option value={HelpTicketType.COMPLAINT}>Queja</option>
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Asunto *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe brevemente tu problema"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={compact ? 4 : 6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Describe detalladamente tu problema o consulta"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Enviando...
          </>
        ) : (
          <>
            <Send size={16} />
            Enviar Ticket
          </>
        )}
      </button>
    </form>
  );
};

export default CreateHelpTicket;