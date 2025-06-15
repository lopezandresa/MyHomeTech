import { ChevronRightIcon, UserIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ServiceRequestModal from './auth/ServiceRequestModal'
import AuthModal from './auth/AuthModal'

const Hero = () => {
  const { isAuthenticated, user } = useAuth()
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleServiceRequest = () => {
    setServiceModalOpen(true)
  }

  const handleOpenAuth = () => {
    setAuthModalOpen(true)
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const renderActionButtons = () => {
    if (!isAuthenticated) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.button
            onClick={handleOpenAuth}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-300"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10 flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              Comenzar Ahora
            </span>
          </motion.button>
          
          <motion.button
            onClick={scrollToContact}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group text-gray-700 px-8 py-4 rounded-2xl font-medium text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 bg-white/80 backdrop-blur-sm"
          >
            <span className="flex items-center">
              Ver cómo funciona
              <ArrowDownIcon className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform duration-300" />
            </span>
          </motion.button>
        </motion.div>
      )
    }

    if (user?.role === 'client') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.button
            onClick={handleServiceRequest}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10 flex items-center">
              🔧 Solicitar Técnico
              <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </motion.button>
          
          <motion.button
            onClick={handleGoToDashboard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-gray-700 px-8 py-4 rounded-2xl font-medium text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 bg-white/80 backdrop-blur-sm"
          >
            Ver Mis Solicitudes
          </motion.button>
        </motion.div>
      )
    }

    if (user?.role === 'technician') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.button
            onClick={handleGoToDashboard}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10 flex items-center">
              🛠️ Ver Trabajos Disponibles
              <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </motion.button>
        </motion.div>
      )
    }

    return null
  }

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
        
        {/* Diagonal Split Background */}
        <div className="absolute inset-0">
          {/* Left diagonal section - Content area */}
          <motion.div
            initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
            animate={{ clipPath: "polygon(0 0, 70% 0, 50% 100%, 0 100%)" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50"
          />
          
          {/* Right diagonal section - Image background */}
          <motion.div
            initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
            animate={{ clipPath: "polygon(65% 0, 100% 0, 100% 100%, 45% 100%)" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://www.datocms-assets.com/38028/1623871435-technician-performing-preventive-maintenance-task.jpg?auto=compress&fm=webp&w=1058)',
              backgroundSize: 'contain',
              backgroundPosition: 'center right',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Overlay for better contrast and integration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-indigo-500/40 to-blue-700/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent" />
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-blue-100/20 to-indigo-100/20"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 20}%`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
            
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-left relative z-20"
            >
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="inline-flex items-center mb-8"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 shadow-lg"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    🔧
                  </motion.span>
                  Plataforma de técnicos especializados
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                </motion.span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight"
              >
                {isAuthenticated && user ? (
                  <>
                    {user.role === 'client' ? 'Solicita un' : 'Encuentra'}{' '}
                    <motion.span
                      initial={{ backgroundPosition: "0% 50%" }}
                      animate={{ backgroundPosition: "100% 50%" }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
                    >
                      técnico
                    </motion.span>
                    <br />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 }}
                    >
                      {user.role === 'client' ? 'especializado' : 'tu próximo trabajo'}
                    </motion.span>
                  </>
                ) : (
                  <>
                    Encuentra el{' '}
                    <motion.span
                      initial={{ backgroundPosition: "0% 50%" }}
                      animate={{ backgroundPosition: "100% 50%" }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
                    >
                      técnico perfecto
                    </motion.span>
                    <br />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 }}
                    >
                      para tu hogar
                    </motion.span>
                  </>
                )}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed"
              >
                Conectamos tu hogar con técnicos especializados en reparación 
                de electrodomésticos. Rápido, confiable y desde la comodidad de tu casa.
              </motion.p>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
              >
                {renderActionButtons()}
              </motion.div>

              {/* Process indicator below buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-sm">🏠</span>
                  </motion.div>
                  <div className="flex-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, delay: 2.2 }}
                      className="h-3 bg-gray-200 rounded-full mb-2 overflow-hidden"
                    >
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 1.5, delay: 2.8 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      />
                    </motion.div>
                    <p className="text-sm text-gray-600">Conectando with técnicos especializados...</p>
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.5 }}
                  className="text-center text-sm text-gray-500 mt-4"
                >
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨ Proceso automatizado y seguro
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column - Now empty since image is background */}
            <div className="relative order-first lg:order-last">
              {/* Optional: Add floating elements over the background image */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
                className="relative z-20 flex flex-col items-center lg:items-end space-y-6 mt-20"
              >

              </motion.div>
            </div>

          </div>
        </div>

        {/* Diagonal divider line with worn/distressed effect */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none z-30"
        >
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              {/* Gradient for the main line */}
              <linearGradient id="diagonal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                <stop offset="30%" stopColor="rgba(99, 102, 241, 0.6)" />
                <stop offset="70%" stopColor="rgba(139, 92, 246, 0.5)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
              </linearGradient>
              
              {/* Filter for worn/distressed effect */}
              <filter id="roughen">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" seed="1"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                <feGaussianBlur stdDeviation="0.5" result="blur"/>
              </filter>
              
              {/* Shadow filter */}
              <filter id="shadow">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(0,0,0,0.1)"/>
              </filter>
            </defs>
            
            {/* Main diagonal line with distressed effect */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.2, ease: "easeInOut" }}
              d="M 0,100 Q 20,95 35,85 Q 50,75 65,25 Q 68,15 70,0"
              stroke="url(#diagonal-gradient)" 
              strokeWidth="0.3"
              fill="none"
              filter="url(#roughen)"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Additional worn edge lines for more distressed look */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, delay: 1.4, ease: "easeInOut" }}
              d="M 2,98 Q 22,93 37,83 Q 52,73 67,23 Q 70,13 72,2"
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="0.1"
              fill="none"
              filter="url(#roughen)"
              vectorEffect="non-scaling-stroke"
            />
            
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, delay: 1.6, ease: "easeInOut" }}
              d="M -2,102 Q 18,97 33,87 Q 48,77 63,27 Q 66,17 68,-2"
              stroke="rgba(59, 130, 246, 0.2)" 
              strokeWidth="0.1"
              fill="none"
              filter="url(#roughen)"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
          onClick={scrollToContact}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-sm mb-2 font-medium">Descubre más</span>
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="w-8 h-12 border-2 border-gray-300 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Modals */}
      {isAuthenticated && user?.role === 'client' && (
        <ServiceRequestModal 
          isOpen={serviceModalOpen}
          onClose={() => setServiceModalOpen(false)}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  )
}

export default Hero
