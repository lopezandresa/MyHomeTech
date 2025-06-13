import { useState, useEffect, useRef } from 'react'

interface UseCountdownProps {
  expiresAt: string | Date
  onExpire?: () => void
}

interface CountdownState {
  timeLeft: number
  isExpired: boolean
  minutes: number
  seconds: number
  progress: number // Porcentaje de tiempo transcurrido (0-100)
}

export const useCountdown = ({ expiresAt, onExpire }: UseCountdownProps): CountdownState => {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const totalTimeRef = useRef<number>(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const targetTime = new Date(expiresAt).getTime()
      const difference = targetTime - now

      if (difference <= 0) {
        setTimeLeft(0)
        setIsExpired(true)
        if (onExpire) {
          onExpire()
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        return 0
      }

      return Math.floor(difference / 1000) // Convertir a segundos
    }

    // Calcular tiempo total al inicio
    const initialTimeLeft = calculateTimeLeft()
    if (totalTimeRef.current === 0) {
      totalTimeRef.current = initialTimeLeft
    }

    setTimeLeft(initialTimeLeft)

    // Solo crear intervalo si no ha expirado
    if (!isExpired && initialTimeLeft > 0) {
      intervalRef.current = setInterval(() => {
        const newTimeLeft = calculateTimeLeft()
        setTimeLeft(newTimeLeft)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [expiresAt, onExpire, isExpired])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = totalTimeRef.current > 0 ? 
    ((totalTimeRef.current - timeLeft) / totalTimeRef.current) * 100 : 0

  return {
    timeLeft,
    isExpired,
    minutes,
    seconds,
    progress: Math.min(100, Math.max(0, progress))
  }
}