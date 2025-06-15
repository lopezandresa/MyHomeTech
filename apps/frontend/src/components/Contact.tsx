import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import AuthModal from './auth/AuthModal'

const Contact = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const steps = [
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
      title: 'Servicio en tu Hogar',
      description: 'El técnico seleccionado repara tu electrodoméstico',
      icon: '🏠',
      color: 'from-green-500 to-green-600'
    }
  ]

  return (
    <>
      <section id="contact" className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-block bg-gray-50 px-6 py-2 rounded-full text-sm font-medium text-gray-600 shadow-sm border border-gray-200 mb-6"
            >
              🚀 Proceso simple
            </motion.span>
            
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              ¿Cómo 
              <motion.span
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: "100% 50%" }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
              >
                {" "}funciona?
              </motion.span>
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Solo 4 pasos para conectar tu hogar con el técnico perfecto
            </motion.p>
          </motion.div>

          {/* Steps Container */}
          <div className="relative">
            {/* Animated connecting line */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "calc(100% - 8rem)" }}
              transition={{ duration: 2, delay: 0.5 }}
              viewport={{ once: true }}
              className="hidden lg:block absolute top-24 left-16 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 z-0"
            />

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group cursor-pointer"
                >
                  {/* Step Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                    
                    {/* Background gradient on hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.03 }}
                      className={`absolute inset-0 bg-gradient-to-br ${step.color}`}
                    />

                    {/* Step Number */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10`}
                    >
                      <span className="text-white font-bold text-xl">{step.number}</span>
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1, type: "spring" }}
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

                      {/* Animated progress indicator */}
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.2 }}
                        viewport={{ once: true }}
                        className="h-1 bg-gray-100 rounded-full overflow-hidden mx-auto"
                      >
                        <motion.div
                          initial={{ x: "-100%" }}
                          whileInView={{ x: "0%" }}
                          transition={{ duration: 0.8, delay: 1.2 + index * 0.2 }}
                          viewport={{ once: true }}
                          className={`h-full bg-gradient-to-r ${step.color} rounded-full`}
                        />
                      </motion.div>
                    </div>

                    {/* Arrow connector for larger screens */}
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 1.5 + index * 0.1 }}
                        viewport={{ once: true }}
                        className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-20"
                      >
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100"
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
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <motion.button
                onClick={() => setAuthModalOpen(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden bg-gray-900 text-white px-10 py-5 rounded-2xl font-semibold text-lg shadow-2xl transition-all duration-300"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center">
                  ¡Comenzar ahora es gratis!
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-3"
                  >
                    ✨
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              viewport={{ once: true }}
              className="text-gray-500 text-sm mt-4"
            >
              Sin compromisos • Registro gratuito • Soporte 24/7
            </motion.p>
          </motion.div>

          {/* Floating elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-blue-100/30 to-indigo-100/30"
                animate={{
                  x: [0, 50, 0],
                  y: [0, -30, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  top: `${30 + i * 20}%`,
                  right: `${5 + i * 10}%`,
                }}
              />
            ))}
          </div>
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
