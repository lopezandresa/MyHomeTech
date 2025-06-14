import React from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <About />
      <Contact />
      <Footer />
    </>
  )
}

export default HomePage