import { 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  DevicePhoneMobileIcon,
  StarIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const Features = () => {
  const features = [
    {
      name: 'Técnicos Certificados',
      description: 'Todos nuestros técnicos están certificados y cuentan con años de experiencia en reparación de electrodomésticos.',
      icon: WrenchScrewdriverIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Servicio Garantizado',
      description: 'Ofrecemos garantía en todos nuestros servicios. Tu satisfacción y tranquilidad son nuestra prioridad.',
      icon: ShieldCheckIcon,
      color: 'from-blue-600 to-blue-700'
    },
    {
      name: 'Respuesta Rápida',
      description: 'Técnicos disponibles las 24 horas. Agenda tu cita y recibe atención el mismo día.',
      icon: ClockIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'App Fácil de Usar',
      description: 'Solicita servicios, realiza pagos y califica técnicos desde nuestra aplicación móvil intuitiva.',
      icon: DevicePhoneMobileIcon,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      name: 'Técnicos Calificados',
      description: 'Sistema de calificaciones y reseñas que te ayuda a elegir al mejor técnico para tu necesidad.',
      icon: StarIcon,
      color: 'from-blue-600 to-purple-600'
    },
    {
      name: 'Servicio a Domicilio',
      description: 'Los técnicos van directo a tu hogar con todas las herramientas necesarias para la reparación.',
      icon: MapPinIcon,
      color: 'from-purple-500 to-blue-600'
    }
  ]

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Servicios que
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> transforman </span>
            tu experiencia
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre por qué HomeTech es la plataforma líder para conectar hogares 
            con técnicos especializados en reparación de electrodomésticos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8">
                <div className="flex items-center justify-center w-16 h-16 mb-6">
                  <div className={`w-full h-full bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.name}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-800/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="#about"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            Conoce más sobre nosotros
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
