import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Use normal root in dev, GitHub/host sub-path in production
  base: mode === 'production' ? '/LearnFortSportsPark/' : '/',
  plugins: [react()],
}))
