import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'
import UserMenu from './auth/UserMenu'

interface HeaderProps {
  onNavigate?: (page: string) => void
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { isAuthenticated } = useAuth()

  const navigation = [
    { name: 'Inicio', href: '#hero', action: () => onNavigate?.('home') },
    { name: 'Servicios', href: '#features', action: () => onNavigate?.('home') },
    { name: 'Acerca de', href: '#about', action: () => onNavigate?.('home') },
    { name: 'Contacto', href: '#contact', action: () => onNavigate?.('home') },
  ]

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleNavigationClick = (item: typeof navigation[0]) => {
    if (item.action) {
      item.action()
    }
    // For anchor links, still scroll to section if we're on home page
    if (item.href.startsWith('#')) {
      setTimeout(() => {
        const element = document.querySelector(item.href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
          <div className="flex w-full items-center justify-between border-b border-blue-500/10 py-4 lg:border-none">
            <div className="flex items-center">
              <button 
                onClick={() => onNavigate?.('home')}
                className="flex items-center space-x-2"
              >
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">HT</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  HomeTech
                </span>
              </button>
            </div>
            
            <div className="ml-10 hidden space-x-8 lg:block">
              {navigation.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigationClick(link)}
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="ml-6 hidden lg:block">
              {isAuthenticated ? (
                <UserMenu onNavigate={onNavigate} />
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-base font-medium text-white shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                  >
                    Únete Ahora
                  </button>
                </div>
              )}
            </div>

            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Abrir menú principal</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden">
              <div className="space-y-2 py-6">
                {navigation.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      handleNavigationClick(link)
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {link.name}
                  </button>
                ))}
                
                {isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200">
                    <UserMenu onNavigate={onNavigate} />
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => {
                        handleAuthClick('login')
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('register')
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-base font-medium text-white shadow-lg"
                    >
                      Únete Ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  )
}

export default Header
