import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, 
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
