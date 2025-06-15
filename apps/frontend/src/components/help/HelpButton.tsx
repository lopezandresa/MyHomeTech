import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import CreateHelpTicket from './CreateHelpTicket';

const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-40"
        title="¿Necesitas ayuda?"
      >
        <HelpCircle size={24} />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                ¿Necesitas ayuda?
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Crea un ticket de ayuda y nuestro equipo te contactará pronto.
              </p>
              <CreateHelpTicket compact onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;