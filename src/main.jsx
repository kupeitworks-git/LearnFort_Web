import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  HashRouter as Router,   // ⬅⬅⬅ FIXED HERE
  useLocation,
  Link
} from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

function Footer() {
  const { pathname } = useLocation()
  const year = new Date().getFullYear()
  const isAdmin = pathname.startsWith('/admin')
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
    { label: 'Manage Profile', href: '/profile' },
    { label: 'Manage Bookings', href: '/bookings' },
    { label: 'Manage Users', href: '/users' },
    { label: 'Contact Messages', href: '/contact' },
    { label: 'Manage Sports', href: '/sports' },
    { label: 'Manage Gallery', href: '/gallery' },
    { label: 'Manage Settings', href: '/settings' },
  ]

  const menus = isAdmin ? adminMenus : userMenus

  return (
    <footer className="mt-12">
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
            <div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">LearnFort Sports Park</h3>
              <p className="text-sm text-slate-200/80 mb-4 max-w-sm">
                Your premier destination for sports and fitness in Dindigul.
              </p>

              <div className="flex items-center gap-3">
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
            </div> <div>


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
                      <span className="block">Batlagundu Road, Bangalapatti,<br/> Nilakottai (Taluk),</span>
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
                    <div className="grid grid-cols-[110px_auto] gap-y-1 text-slate-200/90">
                      <span className="font-medium text-slate-50">Primary</span>
                      <a href="mailto:info@learnfortsports.com" className="hover:text-cyan-300 hover:underline">info@learnfortsports.com</a>
                      <span className="font-medium text-slate-50">Support</span>
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
            © {year} LearnFort Sports Park. All rights reserved.
          </div>
        </div>
      </div>
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