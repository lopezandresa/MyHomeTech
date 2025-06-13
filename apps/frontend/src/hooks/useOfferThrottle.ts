import { useState } from 'react'

interface UseOfferThrottleReturn {
  canMakeOffer: boolean
  timeLeft: number
  startThrottle: () => void
}

export const useOfferThrottle = (): UseOfferThrottleReturn => {
  const [canMakeOffer, setCanMakeOffer] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)

  const startThrottle = () => {
    setCanMakeOffer(false)
    setTimeLeft(10)
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanMakeOffer(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return { canMakeOffer, timeLeft, startThrottle }
}
