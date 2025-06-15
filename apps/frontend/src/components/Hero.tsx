import { ChevronRightIcon, PlayIcon, UserIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ServiceRequestModal from './auth/ServiceRequestModal'
import AuthModal from './auth/AuthModal'
import { ChevronDownIcon } from 'lucide-react'

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

  const renderActionButtons = () => {
    if (!isAuthenticated) {
      return (
        <>
          <button
            onClick={handleOpenAuth}
            className="group inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            <UserIcon className="mr-2 h-5 w-5" />
            Comenzar Ahora
          </button>
          
          <button className="group inline-flex items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200">
            <PlayIcon className="mr-3 h-5 w-5" />
            Ver cómo funciona
            <ChevronDownIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      )
    }

    if (user?.role === 'client') {
      return (
        <>
          <button
            onClick={handleServiceRequest}
            className="group inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            🔧 Solicitar Técnico
            <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={handleGoToDashboard}
            className="group inline-flex items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Ver Mis Solicitudes
          </button>
        </>
      )
    }

    if (user?.role === 'technician') {
      return (
        <>
          <button
            onClick={handleGoToDashboard}
            className="group inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            🛠️ Ver Trabajos Disponibles
            <ChevronRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="group inline-flex items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200">
            <PlayIcon className="mr-3 h-5 w-5" />
            Ver Demo
          </button>
        </>
      )
    }

    return (
      <button className="group inline-flex items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200">
        <PlayIcon className="mr-3 h-5 w-5" />
        Ver Demo
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
      <section id="hero" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-bl from-indigo-400/5 to-purple-400/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
            
            {/* Content */}
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                  🔧 Plataforma de técnicos especializados
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              >
                {isAuthenticated && user ? (
                  <>
                    {user.role === 'client' ? 'Solicita un' : 'Encuentra'}{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      técnico
                    </span>
                    <br />
                    {user.role === 'client' ? 'especializado' : 'tu próximo trabajo'}
                  </>
                ) : (
                  <>
                    Encuentra el{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      técnico perfecto
                    </span>
                    <br />
                    para tu hogar
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed"
              >
                {getWelcomeMessage()}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {renderActionButtons()}
              </motion.div>
            </div>

            {/* Technician Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative order-first lg:order-last"
            >
              <div className="relative">
                {/* Background decorative circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-xl transform scale-110"></div>
                
                {/* Main image container */}
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                    alt="Técnico especializado trabajando"
                    className="w-full h-auto rounded-2xl shadow-lg object-cover aspect-[4/5]"
                  />
                  
                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-700">Técnicos verificados</span>
                    </div>
                  </div>
                  
                  {/* Bottom floating element */}
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">⭐</div>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">Calidad garantizada</div>
                        <div className="text-gray-500">Servicio profesional</div>
                      </div>
                    </div>
                  </div>
                </div>
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
          <div className="flex flex-col items-center text-gray-500">
            <span className="text-sm mb-2">Descubre más</span>
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
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
