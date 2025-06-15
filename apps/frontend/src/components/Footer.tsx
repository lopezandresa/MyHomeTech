import { motion } from 'framer-motion'

const Footer = () => {
  const navigation = {
    support: [
      { name: 'Centro de ayuda', href: '#help' },
      { name: 'Contacto', href: '#contact' },
    ],
    company: [
      { name: 'Acerca de', href: '#about' },
      { name: 'Únete como técnico', href: '#' },
    ],
    legal: [
      { name: 'Términos de servicio', href: '#' },
      { name: 'Política de privacidad', href: '#' },
    ],
  }

  return (
    <footer className="relative bg-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              top: `${10 + i * 20}%`,
              left: `${5 + i * 25}%`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl"
                  />
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                    <img 
                      src="/MyHomeTech-Logo-1.svg" 
                      alt="MyHomeTech" 
                      className="h-10 w-10"
                    />
                  </div>
                </motion.div>
                <div>
                  <motion.h3
                    initial={{ backgroundPosition: "0% 50%" }}
                    animate={{ backgroundPosition: "100% 50%" }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                    className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-[length:200%_auto] bg-clip-text text-transparent"
                  >
                    MyHomeTech
                  </motion.h3>
                  <motion.p
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-blue-200/70 text-sm"
                  >
                    Conectando hogares
                  </motion.p>
                </div>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-gray-300 leading-relaxed max-w-md"
              >
                Plataforma que conecta hogares con técnicos especializados en 
                reparación de electrodomésticos de manera rápida y confiable.
              </motion.p>

              {/* Minimalist status indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                />
                <span className="text-gray-300 text-sm font-medium">Plataforma en línea</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation Sections */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {Object.entries(navigation).map(([category, items], categoryIndex) => {
              const colors = [
                'from-blue-400 to-blue-500',
                'from-indigo-400 to-indigo-500', 
                'from-purple-400 to-purple-500'
              ]
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: categoryIndex * 0.5 }}
                      className={`w-2 h-6 bg-gradient-to-b ${colors[categoryIndex]} rounded-full mr-3`}
                    />
                    {category === 'support' ? 'Soporte' : category === 'company' ? 'Empresa' : 'Legal'}
                  </h3>
                  <ul className="space-y-3">
                    {items.map((item, itemIndex) => (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                        viewport={{ once: true }}
                      >
                        <motion.a 
                          href={item.href} 
                          whileHover={{ x: 5 }}
                          className="group flex items-center text-gray-300 hover:text-white transition-all duration-200"
                        >
                          <motion.span
                            initial={{ width: 4, height: 4 }}
                            whileHover={{ width: 8, height: 4 }}
                            className={`bg-gradient-to-r ${colors[categoryIndex]} rounded-full mr-3 transition-all duration-200`}
                          />
                          {item.name}
                        </motion.a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-2"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-gray-400 text-sm">Sistema activo</span>
              </motion.div>
              <div className="w-px h-4 bg-gray-600" />
              <span className="text-gray-400 text-sm">
                &copy; 2025 MyHomeTech. Todos los derechos reservados.
              </span>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-1 cursor-pointer"
            >
              <span className="text-gray-400 text-sm">Hecho con</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-red-400 text-lg"
              >
                ♥
              </motion.span>
              <span className="text-gray-400 text-sm">en Colombia</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
