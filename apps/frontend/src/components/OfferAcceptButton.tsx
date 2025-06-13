import React from 'react'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useOfferCountdown } from '../hooks/useOfferCountdown'

interface OfferAcceptButtonProps {
  offerId: number
  requestId: number
  price: number
  createdAt: string
  onAccept: (requestId: number, offerId: number) => void
  disabled?: boolean
}

export const OfferAcceptButton: React.FC<OfferAcceptButtonProps> = ({
  offerId,
  requestId,
  price,
  createdAt,
  onAccept,
  disabled = false
}) => {
  const { timeLeft, isExpired, progress } = useOfferCountdown(createdAt)

  const handleClick = () => {
    if (!isExpired && !disabled) {
      onAccept(requestId, offerId)
    }
  }

  if (isExpired) {
    return (
      <button
        disabled
        className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 font-medium relative opacity-75"
      >
        <ClockIcon className="h-4 w-4" />
        Oferta Expirada (10s)
      </button>
    )
  }

  // Color changes based on time left
  const getBackgroundColor = () => {
    if (timeLeft > 7) return 'bg-green-600 hover:bg-green-700'
    if (timeLeft > 4) return 'bg-yellow-500 hover:bg-yellow-600'
    return 'bg-red-500 hover:bg-red-600'
  }

  const getProgressColor = () => {
    if (timeLeft > 7) return 'bg-green-800'
    if (timeLeft > 4) return 'bg-yellow-700'
    return 'bg-red-700'
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium relative overflow-hidden ${
        disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : `${getBackgroundColor()} text-white transform hover:scale-[1.02] active:scale-[0.98]`
      }`}
    >
      {/* Progress bar background - shows time remaining */}
      <div 
        className={`absolute inset-0 transition-all duration-100 ease-linear ${getProgressColor()}`}
        style={{ 
          width: `${100 - progress}%`,
          right: 0,
          left: 'auto'
        }}
      />
      
      {/* Button content */}
      <div className="relative z-10 flex items-center gap-2">
        <CheckCircleIcon className="h-4 w-4" />
        <span>Aceptar ${price.toLocaleString()} COP</span>
        <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-white/20 rounded text-xs font-mono">
          <ClockIcon className="h-3 w-3" />
          <span className={timeLeft <= 3 ? 'animate-pulse font-bold' : ''}>{timeLeft}s</span>
        </div>
      </div>
    </button>
  )
}
