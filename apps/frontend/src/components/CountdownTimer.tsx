import React from 'react'
import { motion } from 'framer-motion'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useCountdown } from '../hooks/useCountdown'

interface CountdownTimerProps {
  expiresAt: string | Date
  onExpire?: () => void
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpire,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const { minutes, seconds, progress, isExpired } = useCountdown({
    expiresAt,
    onExpire
  })

  // Configuraciones de tamaño
  const sizeConfig = {
    sm: {
      container: 'text-xs',
      icon: 'h-3 w-3',
      progress: 'h-1',
      text: 'px-2 py-1'
    },
    md: {
      container: 'text-sm',
      icon: 'h-4 w-4',
      progress: 'h-2',
      text: 'px-3 py-1'
    },
    lg: {
      container: 'text-base',
      icon: 'h-5 w-5',
      progress: 'h-3',
      text: 'px-4 py-2'
    }
  }

  const config = sizeConfig[size]

  // Determinar color basado en el progreso
  const getProgressColor = () => {
    if (isExpired) return 'bg-red-500'
    if (progress > 80) return 'bg-red-500'
    if (progress > 60) return 'bg-orange-500'
    if (progress > 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTextColor = () => {
    if (isExpired) return 'text-red-700'
    if (progress > 80) return 'text-red-700'
    if (progress > 60) return 'text-orange-700'
    if (progress > 40) return 'text-yellow-700'
    return 'text-green-700'
  }

  const getBgColor = () => {
    if (isExpired) return 'bg-red-50 border-red-200'
    if (progress > 80) return 'bg-red-50 border-red-200'
    if (progress > 60) return 'bg-orange-50 border-orange-200'
    if (progress > 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, delay: 1 }}
        className={`inline-flex items-center space-x-2 rounded-full border ${config.text} ${getBgColor()} ${getTextColor()} ${config.container} ${className}`}
      >
        {showIcon && <ClockIcon className={`${config.icon} flex-shrink-0`} />}
        <span className="font-medium">Expirada</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex flex-col space-y-1 rounded-lg border ${config.text} ${getBgColor()} ${className}`}
    >
      {/* Header con icono y tiempo */}
      <div className={`flex items-center space-x-2 ${config.text}`}>
        {showIcon && <ClockIcon className={`${config.icon} ${getTextColor()} flex-shrink-0`} />}
        <span className={`font-medium ${getTextColor()}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${config.progress}`}>
        <motion.div
          className={`${config.progress} ${getProgressColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

export default CountdownTimer