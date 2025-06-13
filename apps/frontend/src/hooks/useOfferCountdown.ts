import { useState, useEffect } from 'react'

interface UseOfferCountdownReturn {
  timeLeft: number
  isExpired: boolean
  progress: number // 0-100 for progress bar
}

export const useOfferCountdown = (createdAt: string): UseOfferCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState(0)
  
  useEffect(() => {
    const updateCountdown = () => {
      const offerTime = new Date(createdAt).getTime()
      const now = Date.now()
      const elapsed = now - offerTime
      const timeLimit = 10 * 1000 // 10 seconds
      const remaining = Math.max(0, timeLimit - elapsed)
      
      setTimeLeft(Math.ceil(remaining / 1000))
    }
    
    // Update immediately
    updateCountdown()
    
    // Update every 100ms for smooth animation
    const interval = setInterval(updateCountdown, 100)
    
    return () => clearInterval(interval)
  }, [createdAt])
  
  const isExpired = timeLeft <= 0
  const progress = Math.max(0, Math.min(100, (timeLeft / 10) * 100))
  
  return { timeLeft, isExpired, progress }
}
