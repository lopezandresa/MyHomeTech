import React from 'react'
import { motion } from 'framer-motion'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { useOfferCountdown } from '../hooks/useOfferCountdown'
import { OfferAcceptButton } from './OfferAcceptButton'
import type { ServiceRequestOffer } from '../types'

interface OfferCardProps {
  offer: ServiceRequestOffer
  index: number
  requestId: number
  onAccept: (requestId: number, offerId: number) => void
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  index,
  requestId,
  onAccept
}) => {
  const { isExpired } = useOfferCountdown(offer.createdAt)

  return (
    <motion.div
      key={offer.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 border rounded-lg transition-all duration-300 ${
        isExpired 
          ? 'bg-gray-50 border-gray-200 opacity-75' 
          : 'bg-white hover:shadow-md border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isExpired ? 'bg-gray-200' : 'bg-blue-100'
            }`}>
              <WrenchScrewdriverIcon className={`h-5 w-5 ${
                isExpired ? 'text-gray-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h5 className={`font-medium ${
                isExpired ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {offer.technician?.firstName || 'Técnico'} {offer.technician?.firstLastName || ''}
              </h5>
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gray-300">★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  (Sin calificaciones aún)
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-600">Precio ofrecido</p>
              <p className={`text-xl font-bold ${
                isExpired ? 'text-gray-500' : 'text-blue-600'
              }`}>
                ${offer.price.toLocaleString()} COP
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Oferta #{index + 1}</p>
              <p className="text-sm text-gray-500">
                {new Date(offer.createdAt).toLocaleDateString()} a las {new Date(offer.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {offer.message && (
            <div className={`mb-3 p-2 rounded border-l-4 ${
              isExpired 
                ? 'bg-gray-100 border-gray-300' 
                : 'bg-blue-50 border-blue-300'
            }`}>
              <p className={`text-sm ${
                isExpired ? 'text-gray-600' : 'text-gray-700'
              }`}>
                {offer.message}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 pt-3 border-t">
        <OfferAcceptButton
          offerId={offer.id}
          requestId={requestId}
          price={offer.price}
          createdAt={offer.createdAt}
          onAccept={onAccept}
        />
      </div>
    </motion.div>
  )
}
