import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifebuoyIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import CreateHelpTicketModal from './CreateHelpTicketModal';
import HelpTicketModal from './HelpTicketModal';
import type { HelpTicketType } from '../../types';

interface QuickHelpButtonProps {
  preselectedServiceId?: number;
  preselectedType?: HelpTicketType;
  className?: string;
}

const QuickHelpButton: React.FC<QuickHelpButtonProps> = ({
  preselectedServiceId,
  preselectedType,
  className = ''
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showTicketsList, setShowTicketsList] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedType, setSelectedType] = useState<HelpTicketType | undefined>(preselectedType);

  // Update selectedType when preselectedType changes
  useEffect(() => {
    setSelectedType(preselectedType);
  }, [preselectedType]);

  // Don't render while auth is loading, if user is not authenticated, or if user is admin
  if (isLoading || !isAuthenticated || user?.role === 'admin') {
    return null;
  }

  const handleTicketCreated = () => {
    setShowModal(false);
    setShowOptions(false);
    setSelectedType(undefined);
  };

  const handleQuickAction = (actionType: HelpTicketType) => {
    setSelectedType(actionType);
    setShowModal(true);
    setShowOptions(false);
  };

  const handleCustomTicket = () => {
    setSelectedType(preselectedType);
    setShowModal(true);
    setShowOptions(false);
  };

  const handleViewTickets = () => {
    setShowTicketsList(true);
    setShowOptions(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedType(undefined);
    setShowOptions(false);
  };

  const handleCloseTicketsList = () => {
    setShowTicketsList(false);
    setShowOptions(false);
  };

  // Close options when clicking outside
  const handleOverlayClick = () => {
    setShowOptions(false);
  };

  const quickActions = [
    {
      type: 'general_inquiry' as HelpTicketType,
      label: 'Consulta General',
      icon: QuestionMarkCircleIcon,
      description: 'Hacer una pregunta general',
      color: 'text-blue-600'
    },
    {
      type: 'technical_issue' as HelpTicketType,
      label: 'Problema Técnico',
      icon: LifebuoyIcon,
      description: 'Reportar un problema técnico',
      color: 'text-red-600'
    },
    {
      type: 'complaint' as HelpTicketType,
      label: 'Queja',
      icon: ChatBubbleLeftRightIcon,
      description: 'Reportar un problema con el servicio',
      color: 'text-orange-600'
    }
  ];

  return (
    <>
      {/* Botón principal */}
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <div className="relative">
          {/* Opciones rápidas */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50"
              >
                <div className="space-y-1">
                  {quickActions.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => handleQuickAction(action.type)}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="button"
                    >
                      <action.icon className={`h-5 w-5 ${action.color} flex-shrink-0`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{action.label}</p>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </button>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <button
                      onClick={handleCustomTicket}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="button"
                    >
                      <LifebuoyIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Crear Ticket Personalizado</p>
                        <p className="text-xs text-gray-600">Todas las opciones disponibles</p>
                      </div>
                    </button>
                  </div>

                  {/* Nueva opción: Ver mis tickets */}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <button
                      onClick={handleViewTickets}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="button"
                    >
                      <ClipboardDocumentListIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Ver Mis Tickets</p>
                        <p className="text-xs text-gray-600">Consultar el estado de mis tickets</p>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Flecha indicadora */}
                <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón principal */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOptions(!showOptions)}
            className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              showOptions 
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            type="button"
            aria-label={showOptions ? 'Cerrar opciones de ayuda' : 'Abrir opciones de ayuda'}
          >
            <AnimatePresence mode="wait">
              {showOptions ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="help"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <LifebuoyIcon className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Indicador de pulse para llamar la atención */}
          {!showOptions && (
            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 pointer-events-none"></div>
          )}
        </div>

        {/* Tooltip */}
        {!showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg transition-opacity pointer-events-none whitespace-nowrap"
          >
            ¿Necesitas ayuda?
            <div className="absolute top-full right-4 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </motion.div>
        )}
      </div>

      {/* Modal de crear ticket */}
      <CreateHelpTicketModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onTicketCreated={handleTicketCreated}
        preselectedType={selectedType}
      />

      {/* Modal de lista de tickets */}
      <HelpTicketModal
        isOpen={showTicketsList}
        onClose={handleCloseTicketsList}
      />

      {/* Overlay para cerrar opciones */}
      {showOptions && (
        <div
          className="fixed inset-0 z-30"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default QuickHelpButton;