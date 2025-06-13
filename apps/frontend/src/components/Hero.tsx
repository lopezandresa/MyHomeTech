import { ChevronRightIcon, PlayIcon, UserIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ServiceRequestModal from './auth/ServiceRequestModal'
import AuthModal from './auth/AuthModal'

const Hero = () => {
  const { isAuthenticated, user } = useAuth()
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleServiceRequest = () => {
    setServiceModalOpen(true)
  }

  const handleOpenAuth = () => {
    setAuthModalOpen(true)
  }

  const handleGoToDashboard = () => {
    // Scroll to appropriate dashboard section or navigate
    if (user?.role === 'client') {
      window.location.hash = '#client-dashboard'
    } else if (user?.role === 'technician') {
      window.location.hash = '#technician-dashboard'
    }
  }

  const renderActionButtons = () => {
    if (!isAuthenticated) {
      // Usuario no autenticado - mostrar un solo botón para autenticarse
      return (
        <>
          <button
            onClick={handleOpenAuth}
            className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-900 shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200 transform hover:scale-105"
          >
            <UserIcon className="mr-2 h-5 w-5" />
            Iniciar Sesión / Registrarse
            <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="group inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200">
            <PlayIcon className="mr-3 h-5 w-5" />
            Ver cómo funciona
          </button>
        </>
      )
    }

    if (user?.role === 'client') {
      // Cliente autenticado - puede solicitar técnico
      return (
        <>
          <button
            onClick={handleServiceRequest}
            className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-900 shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200 transform hover:scale-105"
          >
            🔧 Solicitar Técnico
            <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={handleGoToDashboard}
            className="group inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200"
          >
            Ver Mis Solicitudes
          </button>
        </>
      )
    }

    if (user?.role === 'technician') {
      // Técnico autenticado - ir a dashboard
      return (
        <>
          <button
            onClick={handleGoToDashboard}
            className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-900 shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200 transform hover:scale-105"
          >
            🛠️ Ver Trabajos Disponibles
            <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="group inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200">
            <PlayIcon className="mr-3 h-5 w-5" />
            Ver cómo funciona
          </button>
        </>
      )
    }

    // Fallback
    return (
      <button className="group inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200">
        <PlayIcon className="mr-3 h-5 w-5" />
        Ver cómo funciona
      </button>
    )
  }

  const getWelcomeMessage = () => {
    if (!isAuthenticated) {
      return "Conectamos tu hogar con técnicos especializados en reparación de electrodomésticos. Rápido, confiable y desde la comodidad de tu casa."
    }

    return "Conectamos tu hogar con técnicos especializados en reparación de electrodomésticos."
  }

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600"></div>
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-bounce-subtle"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                🔧 Técnicos especializados a tu disposición
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
            >
              {isAuthenticated && user ? (
                <>
                  {user.role === 'client' ? 'Solicita un' : 'Encuentra'}{' '}
                  <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                    técnico
                  </span>
                  <br />
                  {user.role === 'client' ? 'especializado' : 'tu próximo trabajo'}
                </>
              ) : (
                <>
                  Encuentra el{' '}
                  <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                    técnico
                  </span>
                  <br />
                  perfecto para tu hogar
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              {getWelcomeMessage()}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {renderActionButtons()}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-blue-200">Técnicos certificados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-blue-200">Satisfacción del cliente</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-200">Servicio disponible</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center text-white/60">
            <span className="text-sm mb-2">Desplázate para descubrir más</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Solo mostrar el modal si es un cliente autenticado */}
      {isAuthenticated && user?.role === 'client' && (
        <ServiceRequestModal 
          isOpen={serviceModalOpen}
          onClose={() => setServiceModalOpen(false)}
        />
      )}

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  )
}

export default Hero
