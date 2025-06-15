import { motion } from 'framer-motion'
import { useState, useMemo, useCallback } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import AuthModal from './auth/AuthModal'

const Contact = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleOpenAuth = useCallback(() => {
    setAuthModalOpen(true)
  }, [])

  // Memoized data for better performance
  const steps = useMemo(() => [
    {
      number: '1',
      title: 'Regístrate como Cliente',
      description: 'Crea tu cuenta gratuita en menos de 2 minutos',
      icon: '👤',
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '2', 
      title: 'Solicita tu Servicio',
      description: 'Describe tu problema y establece tu precio',
      icon: '📝',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      number: '3',
      title: 'Conecta con Técnicos',
      description: 'Los técnicos especializados verán tu solicitud',
      icon: '🔗',
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: '4',
      title: 'Recibe el Servicio',
      description: 'El técnico llega a tu hogar y resuelve el problema',
      icon: '🏠',
      color: 'from-green-500 to-green-600'
    }
  ], [])

  // Memoized animation variants
  const animationVariants = useMemo(() => ({
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: (delay = 0) => ({
        duration: 0.6,
        delay,
        ease: "easeOut"
      })
    },
    scaleIn: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: (delay = 0) => ({
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 120
      })
    }
  }), [])

  return (
    <section id="contact" className="relative py-24 bg-white overflow-hidden">
      {/* Floating background elements - positioned at section level */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-blue-100/20 to-indigo-100/20"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              top: `${20 + i * 30}%`,
              right: `${5 + i * 15}%`,
              willChange: 'transform'
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section header */}
        <motion.div
          initial={animationVariants.fadeInUp.initial}
          whileInView={animationVariants.fadeInUp.animate}
          transition={animationVariants.fadeInUp.transition(0)}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={animationVariants.scaleIn.initial}
            whileInView={animationVariants.scaleIn.animate}
            transition={animationVariants.scaleIn.transition(0.2)}
            viewport={{ once: true }}
            className="inline-block bg-gray-50 px-6 py-2 rounded-full text-sm font-medium text-gray-600 shadow-sm border border-gray-200 mb-6"
          >
            🚀 Proceso simple
          </motion.span>
          
          <motion.h3
            initial={animationVariants.fadeInUp.initial}
            whileInView={animationVariants.fadeInUp.animate}
            transition={animationVariants.fadeInUp.transition(0.3)}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            ¿Cómo 
            <motion.span
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
              style={{ willChange: 'background-position' }}
            >
              {" "}funciona?
            </motion.span>
          </motion.h3>
          
          <motion.p
            initial={animationVariants.fadeInUp.initial}
            whileInView={animationVariants.fadeInUp.animate}
            transition={animationVariants.fadeInUp.transition(0.5)}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Solo 4 pasos para conectar tu hogar con el técnico perfecto
          </motion.p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connecting line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "calc(100% - 8rem)" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="hidden lg:block absolute top-20 left-16 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 z-0"
            style={{ willChange: 'width' }}
          />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={animationVariants.fadeInUp.initial}
                whileInView={animationVariants.fadeInUp.animate}
                transition={animationVariants.fadeInUp.transition(index * 0.15)}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group cursor-pointer"
                style={{ willChange: 'transform' }}
              >
                {/* Step Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  
                  {/* Background gradient on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.03 }}
                    className={`absolute inset-0 bg-gradient-to-br ${step.color}`}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Step Number */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    transition={{ duration: 0.4 }}
                    className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10`}
                    style={{ willChange: 'transform' }}
                  >
                    <span className="text-white font-bold text-xl">{step.number}</span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    initial={animationVariants.scaleIn.initial}
                    whileInView={animationVariants.scaleIn.animate}
                    transition={animationVariants.scaleIn.transition(0.3 + index * 0.1)}
                    viewport={{ once: true }}
                    className="text-4xl mb-4 text-center"
                  >
                    {step.icon}
                  </motion.div>

                  {/* Content */}
                  <div className="text-center relative z-10">
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Progress indicator */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="h-1 bg-gray-100 rounded-full overflow-hidden mx-auto"
                    >
                      <motion.div
                        initial={{ x: "-100%" }}
                        whileInView={{ x: "0%" }}
                        transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                        viewport={{ once: true }}
                        className={`h-full bg-gradient-to-r ${step.color} rounded-full`}
                        style={{ willChange: 'transform' }}
                      />
                    </motion.div>
                  </div>

                  {/* Arrow connector for larger screens */}
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-20"
                    >
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100"
                        style={{ willChange: 'transform' }}
                      >
                        <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={animationVariants.fadeInUp.initial}
          whileInView={animationVariants.fadeInUp.animate}
          transition={animationVariants.fadeInUp.transition(1)}
          viewport={{ once: true }}
          className="text-center mt-20 relative z-10"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
            style={{ willChange: 'transform' }}
          >
            <motion.button
              onClick={handleOpenAuth}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative overflow-hidden bg-gray-900 text-white px-10 py-5 rounded-2xl font-semibold text-lg shadow-2xl"
              style={{ willChange: 'transform' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center justify-center">
                ¡Comenzar ahora es gratis!
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-3"
                  style={{ willChange: 'transform' }}
                >
                  ✨
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            viewport={{ once: true }}
            className="text-gray-500 text-sm mt-4"
          >
            Sin compromisos • Registro gratuito • Soporte 24/7
          </motion.p>
        </motion.div>
      </div>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
      />
    </section>
  )
}

export default Contact
