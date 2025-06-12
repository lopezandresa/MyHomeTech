import { UserPlusIcon, CheckCircleIcon, ShieldCheckIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'

const Contact = () => {
  const { isAuthenticated } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleOpenAuth = () => {
    setAuthModalOpen(true)
  }

  const benefits = [
    {
      icon: CheckCircleIcon,
      title: 'Técnicos Verificados',
      description: 'Todos nuestros técnicos están certificados y han pasado verificación de antecedentes.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Servicio Garantizado',
      description: 'Garantía en todos los trabajos realizados. Tu satisfacción es nuestra prioridad.'
    },
    {
      icon: ClockIcon,
      title: 'Respuesta Rápida',
      description: 'Conecta con técnicos disponibles en tu zona en cuestión de minutos.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Precios Justos',
      description: 'Tú estableces el precio que estás dispuesto a pagar por el servicio.'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Regístrate como Cliente',
      description: 'Crea tu cuenta gratuita en menos de 2 minutos'
    },
    {
      number: '2',
      title: 'Solicita tu Servicio',
      description: 'Describe tu problema y establece tu precio'
    },
    {
      number: '3',
      title: 'Conecta con Técnicos',
      description: 'Los técnicos especializados verán tu solicitud'
    },
    {
      number: '4',
      title: 'Servicio en tu Hogar',
      description: 'El técnico seleccionado repara tu electrodoméstico'
    }
  ]

  const handleScrollToAuth = () => {
    document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section id="contact" className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              ¿Necesitas un
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> técnico especializado?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {isAuthenticated ? 
                'Ya tienes una cuenta activa. ¡Solicita tu servicio técnico cuando lo necesites!' :
                'Únete a miles de usuarios que ya encontraron la solución perfecta para sus electrodomésticos.'
              }
            </p>
            
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <button
                  onClick={handleOpenAuth}
                  className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                >
                  <UserPlusIcon className="mr-2 h-5 w-5" />
                  Iniciar Sesión / Registrarse
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* How it Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Cómo funciona?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                    {step.number}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                  
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 transform translate-x-6"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                ¡Comienza ahora mismo!
              </h3>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Únete a la plataforma líder en servicios técnicos para el hogar. 
                Crea tu cuenta gratuita y solicita tu primer técnico en menos de 5 minutos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleOpenAuth}
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200 transform hover:scale-105"
                >
                  <UserPlusIcon className="mr-2 h-5 w-5" />
                  Iniciar Sesión / Registrarse
                </button>
                <div className="text-blue-100">
                  <span className="font-medium">✓ Sin costos ocultos</span> • 
                  <span className="font-medium">✓ Registro en 2 minutos</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* For authenticated users */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-center text-white"
            >
              <CheckCircleIcon className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                ¡Ya eres parte de HomeTech!
              </h3>
              <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Tu cuenta está activa y lista para usar. Solicita servicios técnicos cuando los necesites 
                y conecta con los mejores profesionales de tu zona.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  )
}

export default Contact
