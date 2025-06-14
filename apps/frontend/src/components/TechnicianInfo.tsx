import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  StarIcon,
  UserCircleIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'
import ratingService, { type Rating } from '../services/ratingService'
import type { User } from '../types'

interface TechnicianInfoProps {
  technician: User
  showRatingsButton?: boolean
  compact?: boolean
  proposalCount?: number
}

interface TechnicianStats {
  averageRating: number
  totalRatings: number
  isNew: boolean
}

export const TechnicianInfo: React.FC<TechnicianInfoProps> = ({
  technician,
  showRatingsButton = true,
  compact = false,
  proposalCount
}) => {
  const [stats, setStats] = useState<TechnicianStats>({
    averageRating: 0,
    totalRatings: 0,
    isNew: true
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [showRatingsModal, setShowRatingsModal] = useState(false)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoadingRatings, setIsLoadingRatings] = useState(false)

  useEffect(() => {
    loadTechnicianStats()
  }, [technician.id])

  const loadTechnicianStats = async () => {
    try {
      setIsLoadingStats(true)
      const userRatings = await ratingService.getUserRatings(technician.id)
      
      if (userRatings.length === 0) {
        setStats({
          averageRating: 0,
          totalRatings: 0,
          isNew: true
        })
      } else {
        const averageRating = userRatings.reduce((sum, rating) => sum + rating.score, 0) / userRatings.length
        setStats({
          averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
          totalRatings: userRatings.length,
          isNew: userRatings.length < 5 // Considerar nuevo si tiene menos de 5 calificaciones
        })
      }
    } catch (error) {
      console.error('Error loading technician stats:', error)
      setStats({
        averageRating: 0,
        totalRatings: 0,
        isNew: true
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadRatings = async () => {
    try {
      setIsLoadingRatings(true)
      const userRatings = await ratingService.getUserRatings(technician.id)
      setRatings(userRatings)
    } catch (error) {
      console.error('Error loading ratings:', error)
      setRatings([])
    } finally {
      setIsLoadingRatings(false)
    }
  }

  const handleViewRatings = () => {
    setShowRatingsModal(true)
    loadRatings()
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {rating >= star ? (
              <StarIconSolid className={`${starSize} text-yellow-400`} />
            ) : rating >= star - 0.5 ? (
              <div className="relative">
                <StarIcon className={`${starSize} text-yellow-400`} />
                <StarIconSolid 
                  className={`${starSize} text-yellow-400 absolute top-0 left-0`}
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              </div>
            ) : (
              <StarIcon className={`${starSize} text-gray-300`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          {technician.profilePhotoUrl ? (
            <img
              src={technician.profilePhotoUrl}
              alt={`${technician.firstName} ${technician.firstLastName}`}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
          )}
          {stats.isNew && (
            <SparklesIcon className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {technician.firstName} {technician.firstLastName}
            </p>
            {proposalCount && (
              <span className="text-xs text-gray-500">
                • Propuesta #{proposalCount}
              </span>
            )}
            {stats.isNew && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Nuevo
              </span>
            )}
          </div>
          
          {!isLoadingStats && (
            <div className="flex items-center space-x-1">
              {renderStars(stats.averageRating)}
              <span className="text-xs text-gray-500">
                {stats.totalRatings > 0 ? (
                  `${stats.averageRating} (${stats.totalRatings})`
                ) : (
                  'Sin calificaciones'
                )}
              </span>
            </div>
          )}
        </div>

        {showRatingsButton && stats.totalRatings > 0 && (
          <button
            onClick={handleViewRatings}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        )}

        {showRatingsModal && (
          <RatingsModal
            technician={technician}
            ratings={ratings}
            stats={stats}
            isLoading={isLoadingRatings}
            onClose={() => setShowRatingsModal(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start space-x-4">
        <div className="relative">
          {technician.profilePhotoUrl ? (
            <img
              src={technician.profilePhotoUrl}
              alt={`${technician.firstName} ${technician.firstLastName}`}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="h-16 w-16 text-gray-400" />
          )}
          {stats.isNew && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {technician.firstName} {technician.firstLastName}
            </h3>
            {stats.isNew && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <SparklesIcon className="h-4 w-4 mr-1" />
                Técnico Nuevo
              </span>
            )}
          </div>

          {!isLoadingStats && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                {renderStars(stats.averageRating, 'md')}
                <span className="text-sm font-medium text-gray-900">
                  {stats.averageRating > 0 ? stats.averageRating : 'Sin calificar'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {stats.totalRatings === 0 
                  ? 'Este técnico aún no tiene calificaciones'
                  : `Basado en ${stats.totalRatings} calificación${stats.totalRatings > 1 ? 'es' : ''}`
                }
              </p>
            </div>
          )}

          {showRatingsButton && stats.totalRatings > 0 && (
            <button
              onClick={handleViewRatings}
              className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Ver todas las calificaciones
            </button>
          )}
        </div>
      </div>

      {showRatingsModal && (
        <RatingsModal
          technician={technician}
          ratings={ratings}
          stats={stats}
          isLoading={isLoadingRatings}
          onClose={() => setShowRatingsModal(false)}
        />
      )}
    </div>
  )
}

interface RatingsModalProps {
  technician: User
  ratings: Rating[]
  stats: TechnicianStats
  isLoading: boolean
  onClose: () => void
}

const RatingsModal: React.FC<RatingsModalProps> = ({
  technician,
  ratings,
  stats,
  isLoading,
  onClose
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    ratings.forEach(rating => {
      if (rating.score >= 1 && rating.score <= 5) {
        distribution[rating.score - 1]++
      }
    })
    return distribution
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {technician.profilePhotoUrl ? (
                <img
                  src={technician.profilePhotoUrl}
                  alt={`${technician.firstName} ${technician.firstLastName}`}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-12 w-12 text-gray-400" />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Calificaciones de {technician.firstName} {technician.firstLastName}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  {renderStars(stats.averageRating)}
                  <span className="text-sm text-gray-600">
                    {stats.averageRating} de 5 • {stats.totalRatings} calificaciones
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de calificaciones</h3>
                <div className="space-y-2">
                  {getRatingDistribution().map((count, index) => {
                    const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-12">
                          {index + 1} ★
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentarios de clientes</h3>
                <div className="space-y-4">
                  {ratings.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Este técnico aún no tiene calificaciones.
                    </p>
                  ) : (
                    ratings
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((rating) => (
                        <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            {renderStars(rating.score)}
                            <span className="text-sm text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          {rating.rater && (
                            <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
                              <div className="relative">
                                {rating.rater.profilePhotoUrl ? (
                                  <img
                                    src={rating.rater.profilePhotoUrl}
                                    alt={`${rating.rater.firstName} ${rating.rater.firstLastName}`}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {rating.rater.firstName} {rating.rater.firstLastName}
                                </p>
                                <p className="text-xs text-gray-500">Cliente verificado</p>
                              </div>
                            </div>
                          )}
                          
                          {rating.comment && (
                            <p className="text-gray-700 text-sm leading-relaxed italic">
                              "{rating.comment}"
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default TechnicianInfo