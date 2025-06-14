import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/common/ToastProvider'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Ruta pública que redirige si está autenticado */}
              <Route 
                index 
                element={
                  <RedirectIfAuthenticated>
                    <HomePage />
                  </RedirectIfAuthenticated>
                } 
              />
              
              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Ruta catch-all para redireccionar a home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
