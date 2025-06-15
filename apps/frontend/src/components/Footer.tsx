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
    <footer className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                    <img 
                      src="/MyHomeTech-Logo-1.svg" 
                      alt="MyHomeTech" 
                      className="h-10 w-10"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    MyHomeTech
                  </h3>
                  <p className="text-blue-200/70 text-sm">Conectando hogares</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed max-w-md">
                Plataforma que conecta hogares con técnicos especializados en 
                reparación de electrodomésticos de manera rápida y confiable.
              </p>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3"></div>
                Soporte
              </h3>
              <ul className="space-y-3">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <a 
                      href={item.href} 
                      className="group flex items-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <div className="w-2 h-6 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full mr-3"></div>
                Empresa
              </h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <a 
                      href={item.href} 
                      className="group flex items-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1 h-1 bg-indigo-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                Legal
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <a 
                      href={item.href} 
                      className="group flex items-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                      <span className="w-1 h-1 bg-blue-500 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">Plataforma activa</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <span className="text-gray-400 text-sm">
                &copy; 2025 MyHomeTech. Todos los derechos reservados.
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-gray-400 text-sm">Hecho con</span>
              <span className="text-red-400 text-lg animate-pulse">♥</span>
              <span className="text-gray-400 text-sm">en Colombia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
