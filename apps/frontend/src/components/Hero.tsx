import { ChevronRightIcon, UserIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ServiceRequestModal from './auth/ServiceRequestModal'
import AuthModal from './auth/AuthModal'

const Hero = () => {
  const { isAuthenticated, user } = useAuth()
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleServiceRequest = useCallback(() => {
    setServiceModalOpen(true)
  }, [])

  const handleOpenAuth = useCallback(() => {
    setAuthModalOpen(true)
  }, [])

  const handleGoToDashboard = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  const scrollToContact = useCallback(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Memoized animation variants for better performance
  const animationVariants = useMemo(() => ({
    backgroundElement: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { 
        opacity: [0.3, 0.5, 0.3], 
        scale: [0.8, 1, 0.8],
        x: [0, 50, 0],
        y: [0, -30, 0]
      },
      transition: (i: number) => ({
        duration: 12 + i * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.5
      })
    },
    contentSection: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: (delay: number) => ({
        duration: 0.6,
        delay,
        ease: "easeOut"
      })
    }
  }), [])

  const renderActionButtons = () => {
    if (!isAuthenticated) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
          style={{ willChange: 'transform' }}
        >
          <motion.button
            onClick={handleOpenAuth}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl"
            style={{ willChange: 'transform' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.2 }}
            />
            <span className="relative z-10 flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              Comenzar Ahora
            </span>
          </motion.button>
          
          <motion.button
            onClick={scrollToContact}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="group text-gray-700 px-8 py-4 rounded-2xl font-medium text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            style={{ willChange: 'transform' }}
          >
            <span className="flex items-center">
              Ver cómo funciona
              <ArrowDownIcon className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform duration-200" />
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
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
          style={{ willChange: 'transform' }}
        >
          <motion.button
            onClick={handleServiceRequest}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl"
            style={{ willChange: 'transform' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.2 }}
            />
            <span className="relative z-10 flex items-center">
              🔧 Solicitar Técnico
              <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </motion.button>
          
          <motion.button
            onClick={handleGoToDashboard}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="text-gray-700 px-8 py-4 rounded-2xl font-medium text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            style={{ willChange: 'transform' }}
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
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
          style={{ willChange: 'transform' }}
        >
          <motion.button
            onClick={handleGoToDashboard}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl"
            style={{ willChange: 'transform' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.2 }}
            />
            <span className="relative z-10 flex items-center">
              🛠️ Ver Trabajos Disponibles
              <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
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
        
        {/* Diagonal Split Background - Simplified */}
        <div className="absolute inset-0">
          {/* Left diagonal section - Content area */}
          <motion.div
            initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
            animate={{ clipPath: "polygon(0 0, 70% 0, 50% 100%, 0 100%)" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50"
            style={{ willChange: 'clip-path' }}
          />
          
          {/* Right diagonal section - Image background */}
          <motion.div
            initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
            animate={{ clipPath: "polygon(65% 0, 100% 0, 100% 100%, 45% 100%)" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://www.datocms-assets.com/38028/1623871435-technician-performing-preventive-maintenance-task.jpg?auto=compress&fm=webp&w=1058)',
              backgroundSize: 'contain',
              backgroundPosition: 'center right',
              backgroundRepeat: 'no-repeat',
              willChange: 'clip-path'
            }}
          >
            {/* Overlay for better contrast and integration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-indigo-500/40 to-blue-700/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent" />
          </motion.div>
        </div>

        {/* Reduced animated background elements - Only 3 instead of 5 */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-blue-100/15 to-indigo-100/15"
              {...animationVariants.backgroundElement}
              transition={animationVariants.backgroundElement.transition(i)}
              style={{
                top: `${25 + i * 20}%`,
                left: `${15 + i * 25}%`,
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
            
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-left relative z-20"
              style={{ willChange: 'transform' }}
            >
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="inline-flex items-center mb-8"
              >
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 shadow-lg"
                  style={{ willChange: 'transform' }}
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                    style={{ willChange: 'transform' }}
                  >
                    🔧
                  </motion.span>
                  Plataforma de técnicos especializados
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                </motion.span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight"
                style={{ willChange: 'transform' }}
              >
                {isAuthenticated && user ? (
                  <>
                    {user.role === 'client' ? 'Solicita un' : 'Encuentra'}{' '}
                    <motion.span
                      initial={{ backgroundPosition: "0% 50%" }}
                      animate={{ backgroundPosition: "100% 50%" }}
                      transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
                      style={{ willChange: 'background-position' }}
                    >
                      técnico
                    </motion.span>
                    <br />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
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
                      transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
                      style={{ willChange: 'background-position' }}
                    >
                      técnico perfecto
                    </motion.span>
                    <br />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      para tu hogar
                    </motion.span>
                  </>
                )}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed"
                style={{ willChange: 'transform' }}
              >
                Conectamos tu hogar con técnicos especializados en reparación 
                de electrodomésticos. Rápido, confiable y desde la comodidad de tu casa.
              </motion.p>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                {renderActionButtons()}
              </motion.div>

              {/* Simplified process indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6"
                style={{ willChange: 'transform' }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center"
                    style={{ willChange: 'transform' }}
                  >
                    <span className="text-white text-sm">🏠</span>
                  </motion.div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full mb-2 overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ willChange: 'width' }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">Conectando con técnicos especializados...</p>
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="text-center text-sm text-gray-500 mt-4"
                >
                  <motion.span
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ willChange: 'opacity' }}
                  >
                    ✨ Proceso automatizado y seguro
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column - Simplified */}
            <div className="relative order-first lg:order-last">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="relative z-20 flex flex-col items-center lg:items-end space-y-6 mt-20"
              />
            </div>

          </div>
        </div>

        {/* Simplified scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
          onClick={scrollToContact}
          style={{ willChange: 'transform' }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors"
            style={{ willChange: 'transform' }}
          >
            <span className="text-sm mb-2 font-medium">Descubre más</span>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-8 h-12 border-2 border-gray-300 rounded-full flex justify-center"
              style={{ willChange: 'transform' }}
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-1 h-3 bg-gray-400 rounded-full mt-2"
                style={{ willChange: 'transform' }}
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
