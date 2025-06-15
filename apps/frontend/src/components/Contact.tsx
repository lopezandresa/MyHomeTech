import { motion } from 'framer-motion'
import { useState } from 'react'
import AuthModal from './auth/AuthModal'

const Contact = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false)

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

  // const handleScrollToAuth = () => {
  //   document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' })
  // }

  return (
    <>
      <section id="contact" className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

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
