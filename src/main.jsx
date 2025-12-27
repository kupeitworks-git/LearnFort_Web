import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
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
            <a
              href="/explore-sports"
              className="inline-flex items-center justify-center rounded-full bg-white text-blue-700 px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-blue-50 transition"
            >
              Book a Slot →
            </a>
            <a
              href="/contacting"
              className="inline-flex items-center justify-center rounded-full border border-white/80 text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-black transition"
            >
              Contact Us
            </a>
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

  <ul className="space-y-2 text-sm text-slate-200 text-left">
    
    {/* Address */}
    <li className="flex items-start gap-3">
      <FiMapPin className="mt-0.5 text-cyan-300 flex-shrink-0" />
      <span className="break-words">
        LearnFort Sports Park, Batlagundu road, Bangalapatti, Nilakottai(Taluk), Dindigul(Dist), Tamil Nadu, India, 624202
      </span>
    </li>

  

    {/* Landline Number */}
    <li className="flex items-center gap-3">
      <FiPhone className="text-cyan-300" />
      <a
        href="tel:+914543245622"
        className="hover:text-cyan-300 hover:underline"
      >
      Phone:  +91 45432 45622
      </a>
    </li>

    {/* WhatsApp Number */}
    <li className="flex items-center gap-3">
      <FiPhone className="text-cyan-300" />
      <a
        href="https://wa.me/918124745622"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-cyan-300 hover:underline"
      >
        Mobile: +91 81247 45622
      </a>
    </li>
    <li className="flex items-center gap-3">
      <FiPhone className="text-cyan-300" />
      <a
        href="https://wa.me/919444123722"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-cyan-300 hover:underline"
      >
        WhatsApp: +91 94441 23722
      </a>
    </li>

    {/* Email */}
    <li className="flex items-center gap-3">
      <FiMail className="text-cyan-300" />
      <a
        href="mailto:info@learnfortsports.com"
        className="hover:text-cyan-300 hover:underline"
      >
        info@learnfortsports.com
      </a>
    </li>
    <li className="flex items-center gap-3">
      <FiMail className="text-cyan-300" />
      <a
        href="mailto:learnfortsports@gmail.com"
        className="hover:text-cyan-300 hover:underline"
      >
        learnfortsports@gmail.com
      </a>
    </li>
  </ul>
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
      <Footer />
    </Router>
  </StrictMode>,
)
