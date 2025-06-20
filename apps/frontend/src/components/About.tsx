import { motion } from 'framer-motion'
import { CheckIcon, ShieldCheckIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'

const About = () => {
  // Memoized data to prevent recreating on each render
  const features = useMemo(() => [
    {
      icon: ShieldCheckIcon,
      title: 'Técnicos Verificados',
      description: 'Todos nuestros técnicos pasan por un riguroso proceso de verificación.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: ClockIcon,
      title: 'Respuesta Rápida',
      description: 'Conectamos con técnicos disponibles en tu zona en minutos.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: SparklesIcon,
      title: 'Calidad Garantizada',
      description: 'Especialistas en reparación de neveras, lavadoras, aires acondicionados y más.',
      color: 'from-purple-500 to-purple-600'
    }
  ], [])

  const benefits = useMemo(() => [
    'Técnicos certificados y verificados',
    'Precios transparentes y justos',
    'Disponibilidad 24/7',
    'Garantía en todos los trabajos'
  ], [])

  // Memoized animation variants for better performance
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
        stiffness: 100
      })
    },
    slideInLeft: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.6 }
    },
    slideInRight: {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.6 }
    }
  }), [])

  return (
    <section id="about" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
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
            className="inline-block bg-white px-6 py-2 rounded-full text-sm font-medium text-gray-600 shadow-sm border border-gray-200 mb-6"
          >
            ✨ Tu plataforma de confianza
          </motion.span>
          
          <motion.h2
            initial={animationVariants.fadeInUp.initial}
            whileInView={animationVariants.fadeInUp.animate}
            transition={animationVariants.fadeInUp.transition(0.3)}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Conectamos hogares con
            <motion.span
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
              style={{ willChange: 'background-position' }}
            >
              técnicos especializados
            </motion.span>
          </motion.h2>
          
          <motion.p
            initial={animationVariants.fadeInUp.initial}
            whileInView={animationVariants.fadeInUp.animate}
            transition={animationVariants.fadeInUp.transition(0.5)}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            MyHomeTech facilita el acceso a servicios técnicos de calidad, conectando usuarios 
            con profesionales certificados que ofrecen soluciones rápidas y confiables.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left column - Benefits */}
          <motion.div
            initial={animationVariants.slideInLeft.initial}
            whileInView={animationVariants.slideInLeft.animate}
            transition={animationVariants.slideInLeft.transition}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={animationVariants.fadeInUp.initial}
                  whileInView={animationVariants.fadeInUp.animate}
                  transition={animationVariants.fadeInUp.transition(index * 0.1)}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-4 group cursor-pointer"
                  style={{ willChange: 'transform' }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center"
                    style={{ willChange: 'transform' }}
                  >
                    <CheckIcon className="h-5 w-5 text-white" />
                  </motion.div>
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Simplified statistics */}
            <motion.div
              initial={animationVariants.fadeInUp.initial}
              whileInView={animationVariants.fadeInUp.animate}
              transition={animationVariants.fadeInUp.transition(0.6)}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <motion.div
                    initial={animationVariants.scaleIn.initial}
                    whileInView={animationVariants.scaleIn.animate}
                    transition={animationVariants.scaleIn.transition(0.8)}
                    viewport={{ once: true }}
                    className="text-3xl font-bold text-gray-900 mb-2"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1.5, delay: 1 }}
                      viewport={{ once: true }}
                    >
                      100%
                    </motion.span>
                  </motion.div>
                  <p className="text-sm text-gray-600">Técnicos verificados</p>
                </div>
                <div className="text-center">
                  <motion.div
                    initial={animationVariants.scaleIn.initial}
                    whileInView={animationVariants.scaleIn.animate}
                    transition={animationVariants.scaleIn.transition(1)}
                    viewport={{ once: true }}
                    className="text-3xl font-bold text-gray-900 mb-2"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1.5, delay: 1.2 }}
                      viewport={{ once: true }}
                    >
                      24/7
                    </motion.span>
                  </motion.div>
                  <p className="text-sm text-gray-600">Soporte disponible</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Features */}
          <motion.div
            initial={animationVariants.slideInRight.initial}
            whileInView={animationVariants.slideInRight.animate}
            transition={animationVariants.slideInRight.transition}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={animationVariants.fadeInUp.initial}
                whileInView={animationVariants.fadeInUp.animate}
                transition={animationVariants.fadeInUp.transition(index * 0.2)}
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 group cursor-pointer"
                style={{ willChange: 'transform' }}
              >
                <div className="flex items-start space-x-6">
                  <motion.div
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    style={{ willChange: 'transform' }}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Simplified progress bar */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                  viewport={{ once: true }}
                  className="mt-6 h-1 bg-gray-100 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ x: "-100%" }}
                    whileInView={{ x: "0%" }}
                    transition={{ duration: 0.8, delay: 1 + index * 0.2 }}
                    viewport={{ once: true }}
                    className={`h-full bg-gradient-to-r ${feature.color} rounded-full`}
                    style={{ willChange: 'transform' }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Simplified bottom floating element */}
        <motion.div
          initial={animationVariants.fadeInUp.initial}
          whileInView={animationVariants.fadeInUp.animate}
          transition={animationVariants.fadeInUp.transition(0.8)}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100"
            style={{ willChange: 'transform' }}
          >
            <motion.span
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="text-lg"
              style={{ willChange: 'transform' }}
            >
              ⚡
            </motion.span>
            <span className="text-gray-700 font-medium">Proceso simple y automatizado</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
