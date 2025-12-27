import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router, useLocation, Link } from "react-router-dom"

import './index.css'
import App from './App.jsx'
import { FiMail, FiPhone, FiMapPin, FiArrowUp } from 'react-icons/fi'

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function Footer() {
  const { pathname } = useLocation()
  const year = new Date().getFullYear()
  const isAdmin = pathname.startsWith('/admin')

  const normalizedPath = pathname.toLowerCase()
  const isAuthPage =
    normalizedPath.startsWith('/login') ||
    normalizedPath.startsWith('/register') ||
    normalizedPath.startsWith('/forgot-password')

  if (isAuthPage) return null

  return (
    <footer className="mt-12 relative">
      {/* footer content stays SAME */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full"
      >
        <FiArrowUp size={20} />
      </button>
    </footer>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <App />
      <Footer />
    </Router>
  </StrictMode>
)
