import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Use normal root in dev, GitHub/host sub-path in production
  base: '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increased limit to suppress warnings for reasonable chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'react-icons', 'lucide-react', 'react-datepicker', 'react-hot-toast', 'react-toastify'],
          'vendor-utils': ['axios'],
          'pdf-utils': ['html2canvas', 'jspdf', '@react-pdf/renderer']
        }
      }
    }
  }
}))
