import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Login from './Login'
import Register from './Register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  const handleSwitchToRegister = () => {
    setMode('register')
  }

  const handleSwitchToLogin = () => {
    setMode('login')
  }

  const handleClose = () => {
    setMode('login') // Reset to login when closing
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <Login
                key="login"
                onSwitchToRegister={handleSwitchToRegister}
                onClose={handleClose}
              />
            ) : (
              <Register
                key="register"
                onSwitchToLogin={handleSwitchToLogin}
                onClose={handleClose}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal