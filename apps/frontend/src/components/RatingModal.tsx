import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  XCircleIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'
import type { ServiceRequest } from '../types'

interface RatingModalProps {
  isOpen: boolean
  serviceRequest: ServiceRequest
  onClose: () => void
  onSubmit: (ratingData: { score: number; comment?: string }) => Promise<void>
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  serviceRequest,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({ score: rating, comment: comment.trim() })
      setIsSubmitted(true)
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        setRating(0)
        setComment('')
      }, 2000)
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setRating(0)
    setHoveredRating(0)
    setComment('')
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Gracias por tu calificación!
          </h3>
          <p className="text-gray-600">
            Tu opinión nos ayuda a mejorar el servicio
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Calificar Servicio</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del servicio */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Servicio completado</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Electrodoméstico:</span> {serviceRequest.appliance?.name}</p>
              <p><span className="font-medium">Técnico:</span> {serviceRequest.technician?.firstName} {serviceRequest.technician?.firstLastName}</p>
            </div>
          </div>

          {/* Rating de estrellas */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Cómo calificarías el servicio?
            </label>
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  {star <= (hoveredRating || rating) ? (
                    <StarIconSolid className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Muy malo"}
                {rating === 2 && "Malo"} 
                {rating === 3 && "Regular"}
                {rating === 4 && "Bueno"}
                {rating === 5 && "Excelente"}
              </p>
            )}
          </div>

          {/* Comentario opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Comparte tu experiencia con el servicio..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Enviando...' : 'Calificar Servicio'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default RatingModal