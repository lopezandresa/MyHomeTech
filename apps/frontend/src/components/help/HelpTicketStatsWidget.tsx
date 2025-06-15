import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LifebuoyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { helpTicketService } from '../../services/helpTicketService';
import type { HelpTicketStats } from '../../types';

const HelpTicketStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<HelpTicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const statsData = await helpTicketService.getTicketStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading ticket stats:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error || 'No se pudieron cargar las estadísticas'}</p>
          <button
            onClick={loadStats}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total de Tickets',
      value: stats.total,
      icon: LifebuoyIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'En Revisión',
      value: stats.inReview,
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Resueltos',
      value: stats.resolved,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            Estadísticas de Tickets
          </h3>
          <button
            onClick={loadStats}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Cards de estadísticas principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estadísticas por tipo */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Tickets por Tipo
          </h4>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const typeLabels: Record<string, string> = {
                'cancel_service': 'Cancelaciones',
                'reschedule_service': 'Reagendamientos',
                'technical_issue': 'Problemas Técnicos',
                'payment_issue': 'Problemas de Pago',
                'general_inquiry': 'Consultas Generales',
                'complaint': 'Quejas'
              };

              return (
                <div key={type} className="flex items-center justify-between pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">
                      {typeLabels[type] || type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600">Tasa de Resolución</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending + stats.inReview}
              </p>
              <p className="text-sm text-gray-600">Tickets Activos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpTicketStatsWidget;