import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  HashRouter as Router,   // ⬅⬅⬅ FIXED HERE
  useLocation,
  Link
} from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { FiMail, FiPhone, FiMapPin, FiArrowUp } from 'react-icons/fi'

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function Footer() {
  const { pathname } = useLocation()
  const year = new Date().getFullYear()
  const isAdmin = pathname.startsWith('/admin')
  
  const handleNavigation = (e) => {
    // Only scroll to top if the click is on a navigation link
    if (e.target.closest('a[href^="/"]')) {
      // Small delay to allow the route to change first
      setTimeout(scrollToTop, 100);
    }
  };
  const normalizedPath = pathname.toLowerCase()
  const isAuthPage =
    normalizedPath.startsWith('/login') ||
    normalizedPath.startsWith('/register') ||
    normalizedPath.startsWith('/forgot-password') ||
    normalizedPath.includes('/login?') ||
    normalizedPath.includes('/register?') ||
    normalizedPath.includes('/forgot-password?')
  const isVenuePage = normalizedPath.startsWith('/venue/')

  if (isAuthPage || isVenuePage) return null
  const userMenus = [
    { label: 'Home', href: '/' },
    { label: 'Sports', href: '/games' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  const adminMenus = [
    { label: 'My Profile', href: '/profile' },
    { label: 'Manage Bookings', href: '/bookings' },
    { label: 'Manage Users', href: '/users' },
    { label: 'Contact Messages', href: '/contact' },
    { label: 'Manage Sports', href: '/sports' },
    { label: 'Manage Gallery', href: '/gallery' },
    { label: 'Manage Settings', href: '/settings' },
  ]

  const menus = isAdmin ? adminMenus : userMenus

  return (
    <footer className="mt-12 relative" onClick={handleNavigation}>
      {/* CTA section */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12 flex flex-col items-center text-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              Ready to Experience LearnFort Sports Park?
            </h2>
            <p className="text-sm md:text-base text-blue-50 max-w-2xl">
              Book your first session today and join our community of athletes and fitness enthusiasts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/explore-sports"
              className="inline-flex items-center justify-center rounded-full bg-white text-blue-700 px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-blue-50 transition"
            >
              Book a Slot →
            </Link>
            <Link
              to="/contacting"
              className="inline-flex items-center justify-center rounded-full border border-white/80 text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-black transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Dark footer section */}
      <div className="bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand & description */}
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">LearnFort Sports Park</h3>
              <p className="text-sm text-slate-200/80 mb-6 leading-relaxed">
                LearnFort Sports Park is your ultimate destination for sports and recreation in Dindigul. We provide world-class facilities for cricket, football, tennis, and more, fostering a community of athletes and fitness enthusiasts. Experience the best in sports infrastructure and training with us.
              </p>

              <div className="flex items-center gap-3 mt-auto">
                <a
                  href="https://www.facebook.com/learnfortsports/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-100 hover:bg-slate-700 text-sm"
                >
                  f
                </a>

                <a
                  href="https://x.com/learnfortsports"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-100 hover:bg-slate-700 text-sm"
                >
                  X
                </a>
                <a
                  href="https://www.instagram.com/learnfortsports/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-100 hover:bg-slate-700 text-sm"
                >
                  @
                </a>
                <a
                  href="https://www.youtube.com/@learnfortsports"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-100 hover:bg-slate-700 text-sm"
                >
                  ▶
                </a>
                <a
                  href="https://www.linkedin.com/company/learn-fort-sports/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-100 hover:bg-slate-700 text-sm"
                >
                  in
                </a>
              </div>
            </div>
            {/* Page Links */}
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-slate-100 mb-5 uppercase border-b-2 border-cyan-500 inline-block pb-1">
                Our Page Links
              </h4>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>
                  <Link to="/" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span> Home
                  </Link>
                </li>
                <li>
                  <Link to="/games" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span> Games Lists
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span> Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span> About us
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span> Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span> Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>


            {/* Contact info */}
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-slate-100 mb-3 uppercase">
                Contact Info
              </h4>

              <div className="space-y-6 text-sm text-left">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <FiMapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-slate-200 uppercase">Address</p>
                    <div className="text-slate-200/90 text-sm leading-relaxed">
                      <span className="block font-semibold text-slate-50">LearnFort Sports Park</span>
                      <span className="block">Batlagundu Road, Bangalapatti,<br /> Nilakottai (Taluk),</span>
                      <span className="block">Dindigul (Dist), Tamil Nadu, India - 624202</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <FiPhone className="w-4 h-4" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-slate-200 uppercase">Contact Numbers</p>
                    <div className="grid grid-cols-[110px_auto] gap-y-1 text-slate-200/90">
                      <span className="font-medium text-slate-50">Phone</span>
                      <a href="tel:+914543245622" className="hover:text-cyan-300 hover:underline">+91 45432 45622</a>
                      <span className="font-medium text-slate-50">Mobile</span>
                      <a href="tel:+918124745622" className="hover:text-cyan-300 hover:underline">+91 81247 45622</a>
                      <span className="font-medium text-slate-50">WhatsApp</span>
                      <a
                        href="https://wa.me/919444123722"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300 hover:underline"
                      >
                        +91 94441 23722
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-slate-200 uppercase">Email</p>
                    <div className="flex flex-col gap-1 text-slate-200/90">
                      <a href="mailto:info@learnfortsports.com" className="hover:text-cyan-300 hover:underline">info@learnfortsports.com</a>
                      <a href="mailto:learnfortsports@gmail.com" className="hover:text-cyan-300 hover:underline">learnfortsports@gmail.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400">
            © {year} LearnFort Sports Park.
          </div>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-label="Scroll to top"
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
);