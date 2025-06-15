import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'
import UserMenu from './auth/UserMenu'
import { performanceStyles } from '../utils/animationUtils'

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Memoized navigation data
  const navigation = useMemo(() => [
    { name: 'Inicio', href: '#hero', section: 'hero' },
    { name: 'Acerca de', href: '#about', section: 'about' },
    { name: 'Proceso', href: '#contact', section: 'contact' },
  ], [])

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAuthClick = useCallback(() => {
    setAuthModalOpen(true)
  }, [])

  const handleNavigationClick = useCallback((item: typeof navigation[0]) => {
    // Navegar a home primero y luego hacer scroll
    if (window.location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const element = document.querySelector(item.href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      // Ya estamos en home, solo hacer scroll
      const element = document.querySelector(item.href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [navigate])

  // Memoized animation variants for performance
  const animationVariants = useMemo(() => ({
    header: {
      initial: { y: -100 },
      animate: { y: 0 },
      transition: { duration: 0.5, ease: "easeOut" }
    },
    mobileMenu: {
      initial: { opacity: 0, height: 0 },
      animate: { opacity: 1, height: "auto" },
      exit: { opacity: 0, height: 0 },
      transition: { duration: 0.2 }
    },
    navItem: {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      transition: (index: number) => ({
        duration: 0.3,
        delay: index * 0.05
      })
    }
  }), [])

  return (
    <>
      <motion.header
        initial={animationVariants.header.initial}
        animate={animationVariants.header.animate}
        transition={animationVariants.header.transition}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-100' 
            : 'bg-white/80 backdrop-blur-sm'
        }`}
        style={performanceStyles.willChangeTransform}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex w-full items-center justify-between py-4">
            
            {/* Logo */}
            <motion.div
              transition={{ duration: 0.2 }}
              style={performanceStyles.willChangeTransform}
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl"
                  style={performanceStyles.willChangeTransform}
                />
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-2 shadow-lg">
                  <img 
                    src="/MyHomeTech-Logo-1.svg" 
                    alt="MyHomeTech" 
                    className="h-10 w-10"
                  />
                </div>

                <motion.span
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: "100% 50%" }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
                  style={performanceStyles.willChangeOpacity}
                >
                  MyHomeTech
                </motion.span>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((link, index) => (
                <motion.button
                  key={link.name}
                  initial={animationVariants.navItem.initial}
                  animate={animationVariants.navItem.animate}
                  transition={animationVariants.navItem.transition(index)}
                  onClick={() => handleNavigationClick(link)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-xl group"
                  style={performanceStyles.willChangeTransform}
                >
                  <motion.span
                    className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    layoutId="navbar-hover"
                  />
                  <span className="relative">{link.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Desktop Auth Button */}
            <div className="hidden lg:block">
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  style={performanceStyles.willChangeTransform}
                >
                  <UserMenu />
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  onClick={handleAuthClick}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative overflow-hidden bg-gray-900 text-white px-6 py-3 rounded-2xl font-medium text-sm shadow-xl"
                  style={performanceStyles.willChangeTransform}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10 flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                    <motion.span
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-1"
                      style={performanceStyles.willChangeTransform}
                    >
                      ✨
                    </motion.span>
                  </span>
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={performanceStyles.willChangeTransform}
              >
                <span className="sr-only">Abrir menú principal</span>
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={performanceStyles.willChangeTransform}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={performanceStyles.willChangeTransform}
                    >
                      <Bars3Icon className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={animationVariants.mobileMenu.initial}
                animate={animationVariants.mobileMenu.animate}
                exit={animationVariants.mobileMenu.exit}
                transition={animationVariants.mobileMenu.transition}
                className="lg:hidden overflow-hidden"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  exit={{ y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/95 backdrop-blur-md rounded-2xl m-4 p-6 shadow-xl border border-gray-100"
                >
                  <div className="space-y-3">
                    {navigation.map((link, index) => (
                      <motion.button
                        key={link.name}
                        initial={animationVariants.navItem.initial}
                        animate={animationVariants.navItem.animate}
                        transition={animationVariants.navItem.transition(index)}
                        onClick={() => {
                          handleNavigationClick(link)
                          setMobileMenuOpen(false)
                        }}
                        whileHover={{ x: 3 }}
                        className="block w-full text-left rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                        style={performanceStyles.willChangeTransform}
                      >
                        {link.name}
                      </motion.button>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-200">
                      {isAuthenticated ? (
                        <UserMenu />
                      ) : (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          onClick={() => {
                            handleAuthClick()
                            setMobileMenuOpen(false)
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 text-base font-medium text-white shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                          style={performanceStyles.willChangeTransform}
                        >
                          <UserIcon className="mr-2 h-4 w-4" />
                          Iniciar Sesión
                          <motion.span
                            animate={{ rotate: [0, 180, 360] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="ml-2"
                            style={performanceStyles.willChangeTransform}
                          >
                            ✨
                          </motion.span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  )
}

export default Header
