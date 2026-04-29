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
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/airports': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/airlines': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/flights': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/seats': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/bookings': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/passengers': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/payments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/notifications': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req: any) => { if (req.headers.accept?.includes('text/html')) return '/index.html' }
      },
    },
  },
})
