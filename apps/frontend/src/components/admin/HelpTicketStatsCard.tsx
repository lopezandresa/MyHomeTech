import React from 'react';
import { motion } from 'framer-motion';
import { 
  LifebuoyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { HelpTicketStats } from '../../types';

interface HelpTicketStatsCardProps {
  stats: HelpTicketStats;
}

const HelpTicketStatsCard: React.FC<HelpTicketStatsCardProps> = ({ stats }) => {
  const activeTickets = stats.pending + stats.inReview;
  const resolutionRate = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <LifebuoyIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tickets de Ayuda</h3>
        </div>
        <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <ClockIcon className="h-4 w-4 text-orange-500 mr-1" />
          </div>
          <p className="text-lg font-semibold text-orange-600">{activeTickets}</p>
          <p className="text-sm text-gray-500">Activos</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
          </div>
          <p className="text-lg font-semibold text-green-600">
            {resolutionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">Resueltos</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pendientes</span>
          <span className="font-medium text-orange-600">{stats.pending}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">En Revisión</span>
          <span className="font-medium text-blue-600">{stats.inReview}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Resueltos</span>
          <span className="font-medium text-green-600">{stats.resolved}</span>
        </div>
      </div>

      {stats.pending > 0 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-800">
              {stats.pending} ticket{stats.pending > 1 ? 's' : ''} pendiente{stats.pending > 1 ? 's' : ''} de atención
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HelpTicketStatsCard;