import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'

const Layout: React.FC = () => {
  const location = useLocation()
  
  // No mostrar header en el dashboard
  const shouldShowHeader = !location.pathname.startsWith('/dashboard')

  return (
    <div className="min-h-screen bg-white">
      {shouldShowHeader && <Header />}
      <Outlet />
    </div>
  )
}

export default Layout