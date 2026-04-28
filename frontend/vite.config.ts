import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy all API requests through API Gateway on port 8080
      '/auth': 'http://localhost:8080',
      '/airports': 'http://localhost:8080',
      '/airlines': 'http://localhost:8080',
      '/flights': 'http://localhost:8080',
      '/seats': 'http://localhost:8080',
      '/bookings': 'http://localhost:8080',
      '/passengers': 'http://localhost:8080',
      '/payments': 'http://localhost:8080',
      '/notifications': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
    },
  },
})
