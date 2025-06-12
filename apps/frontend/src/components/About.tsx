import { CheckIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const About = () => {
  const benefits = [
    'Técnicos verificados y certificados',
    'Especialistas en más de 50 tipos de electrodomésticos',
    'Servicio a domicilio sin costo adicional',
    'Soporte técnico 24/7 en español',
    'Garantía en todas las reparaciones',
    'Presupuestos gratuitos y transparentes'
  ]

  const stats = [
    { label: 'Años de experiencia', value: '10+' },
    { label: 'Reparaciones exitosas', value: '15K+' },
    { label: 'Técnicos especializados', value: '500+' },
    { label: 'Satisfacción del cliente', value: '99%' }
  ]

  return (
    <section id="about" className="py-24 bg-white">
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
              Líderes en
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> servicios técnicos </span>
              a domicilio
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              En HomeTech, conectamos hogares con los mejores técnicos especializados en reparación 
              de electrodomésticos. Durante más de una década, hemos revolucionado la forma en que 
              las personas acceden a servicios técnicos de calidad.
            </p>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Nuestro equipo de técnicos certificados cuenta con años de experiencia en reparación 
              de neveras, lavadoras, aires acondicionados, estufas y más. Todos los servicios incluyen 
              garantía y soporte completo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
              >
                Solicita tu servicio
              </a>
            </motion.div>
          </motion.div>

          {/* Right column - Image and Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Placeholder for image */}
            <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center h-96">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🔧</div>
                  <p className="text-xl font-semibold">Técnicos Expertos</p>
                  <p className="text-blue-200">Reparación a domicilio</p>
                </div>
              </div>
              
              {/* Floating stats cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Disponible</div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Garantizado</div>
              </div>
            </div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 mt-8"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
