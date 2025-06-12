const Footer = () => {
  const navigation = {
    servicios: [
      { name: 'Reparación de Neveras', href: '#' },
      { name: 'Reparación de Lavadoras', href: '#' },
      { name: 'Aires Acondicionados', href: '#' },
      { name: 'Electrodomésticos de Cocina', href: '#' },
    ],
    support: [
      { name: 'Centro de ayuda', href: '#' },
      { name: 'Solicitar técnico', href: '#contact' },
      { name: 'Seguimiento de servicio', href: '#' },
      { name: 'Garantías', href: '#' },
    ],
    company: [
      { name: 'Acerca de', href: '#about' },
      // { name: 'Nuestros técnicos', href: '#' },
      { name: 'Únete como técnico', href: '#' },
      // { name: 'Testimonios', href: '#' },
    ],
    legal: [
      { name: 'Privacidad', href: '#' },
      { name: 'Términos de servicio', href: '#' },
      { name: 'Política de garantías', href: '#' },
      // { name: 'Cookies', href: '#' },
    ],
  }

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path fillRule="evenodd" d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.204 5.02.43a5.105 5.105 0 00-1.852 1.204A5.108 5.108 0 00.963 3.486c-.226.5-.348 1.074-.382 2.021C.542 6.455.53 6.862.53 10.482s.013 4.028.048 4.975c.034.947.156 1.521.382 2.021.214.5.491.926.82 1.255.329.329.755.606 1.255.82.5.226 1.074.348 2.021.382.947.035 1.354.048 4.975.048s4.028-.013 4.975-.048c.947-.034 1.521-.156 2.021-.382a5.108 5.108 0 001.255-.82 5.108 5.108 0 00.82-1.255c.226-.5.348-1.074.382-2.021.035-.947.048-1.354.048-4.975s-.013-4.028-.048-4.975c-.034-.947-.156-1.521-.382-2.021a5.108 5.108 0 00-.82-1.255A5.108 5.108 0 0018.514.963c-.5-.226-1.074-.348-2.021-.382C15.546.542 15.139.53 11.518.53h.499zm-.498 2.166c3.608 0 4.034.014 5.459.08.907.042 1.4.194 1.729.323.435.169.745.371 1.071.697.326.326.528.636.697 1.071.129.329.281.822.323 1.729.066 1.425.08 1.851.08 5.459s-.014 4.034-.08 5.459c-.042.907-.194 1.4-.323 1.729-.169.435-.371.745-.697 1.071-.326.326-.636.528-1.071.697-.329.129-.822.281-1.729.323-1.425.066-1.851.08-5.459.08s-4.034-.014-5.459-.08c-.907-.042-1.4-.194-1.729-.323a2.88 2.88 0 01-1.071-.697 2.88 2.88 0 01-.697-1.071c-.129-.329-.281-.822-.323-1.729-.066-1.425-.08-1.851-.08-5.459s.014-4.034.08-5.459c.042-.907.194-1.4.323-1.729.169-.435.371-.745.697-1.071.326-.326.636-.528 1.071-.697.329-.129.822-.281 1.729-.323 1.425-.066 1.851-.08 5.459-.08z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M12.017 15.33a3.33 3.33 0 100-6.66 3.33 3.33 0 000 6.66zm0-8.493a5.163 5.163 0 105.163 5.163 5.163 5.163 0 00-5.163-5.163zm6.532-1.676a1.205 1.205 0 11-2.41 0 1.205 1.205 0 012.41 0z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    }
  ]

  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">HT</span>
              </div>
              <span className="text-2xl font-bold text-white">HomeTech</span>
            </div>
            <p className="text-sm leading-6 text-gray-300">
              Conectamos hogares con técnicos especializados en reparación de electrodomésticos. 
              Servicio rápido, confiable y con garantía en toda Colombia.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Servicios</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.servicios.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Soporte</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Empresa</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <p className="text-xs leading-5 text-gray-400">
              Línea de servicios: +57 (300) 123-4567
            </p>
          </div>
          <p className="mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0">
            &copy; 2025 HomeTech. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
