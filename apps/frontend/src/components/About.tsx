import { CheckIcon, ShieldCheckIcon, ClockIcon, CogIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const About = () => {
  const benefits = [
    'Técnicos verificados y certificados',
    'Especialistas en electrodomésticos del hogar',
    'Servicio a domicilio profesional',
    'Soporte técnico especializado',
    'Garantía en todas las reparaciones',
    'Presupuestos gratuitos y transparentes'
  ]

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Técnicos Verificados',
      description: 'Todos nuestros técnicos pasan por un riguroso proceso de verificación y certificación.'
    },
    {
      icon: ClockIcon,
      title: 'Servicio Oportuno',
      description: 'Respuesta rápida y programación flexible para adaptarnos a tu horario.'
    },
    {
      icon: CogIcon,
      title: 'Amplia Experiencia',
      description: 'Especialistas en reparación de neveras, lavadoras, aires acondicionados y más.'
    }
  ]

  return (
    <section id="about" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Tu plataforma de confianza para
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> servicios técnicos </span>
              especializados
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              MyHomeTech conecta hogares con técnicos especializados en reparación 
              de electrodomésticos. Nuestra plataforma garantiza que encuentres el 
              profesional adecuado para cada necesidad de tu hogar.
            </p>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Facilitamos el acceso a servicios técnicos de calidad, conectando usuarios 
              con profesionales certificados que ofrecen soluciones rápidas y confiables 
              para el mantenimiento y reparación de tus electrodomésticos.
            </p>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right column - Image and Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl overflow-hidden shadow-2xl mb-8">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Técnico reparando electrodomésticos"
                className="w-full h-80 object-cover"
              />
              
              {/* Floating badge */}
              <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-xl p-3 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">Servicio Activo</span>
                </div>
              </div>
            </div>

            {/* Features grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
