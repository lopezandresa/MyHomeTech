import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Dashboard from './components/dashboards/Dashboard'

// Componente principal que maneja la navegación
const AppContent = () => {
  const { isAuthenticated, user } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])
  // Reset to home when user logs out, redirect to dashboard when logged in
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage('home')
    } else if (user && (currentPage === 'home' || currentPage === 'dashboard')) {
      // Redirect authenticated users to their dashboard
      setCurrentPage('dashboard')
    }
  }, [isAuthenticated, user, currentPage])

  const handleNavigation = (page: string) => {
    setCurrentPage(page)
  }
  const renderPage = () => {
    switch (currentPage) {      case 'dashboard':        if (!isAuthenticated || !user) {
          setCurrentPage('home')
          return null
        }
        
        // Usar el dashboard unificado independientemente del rol
        return <Dashboard onNavigate={handleNavigation} />

      case 'profile':
        // TODO: Implement profile page
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil de Usuario</h2>
              <p className="text-gray-600 mb-6">Funcionalidad en desarrollo</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )

      case 'settings':
        // TODO: Implement settings page
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración</h2>
              <p className="text-gray-600 mb-6">Funcionalidad en desarrollo</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )

      default:
        return (
          <>
            <Hero />
            <About />
            <Contact />
            <Footer />
          </>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Cargando HomeTech...</h2>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Only show Header when not on dashboard */}
      {currentPage !== 'dashboard' && <Header onNavigate={handleNavigation} />}
      {renderPage()}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
