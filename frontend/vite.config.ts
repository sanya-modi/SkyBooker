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
      // Auth service — port 8081
      '/auth': 'http://localhost:8081',
      // Airline-airport service — port 8088
      '/airports': 'http://localhost:8088',
      '/airlines': 'http://localhost:8088',
      // Flight service — port 8082
      '/flights': 'http://localhost:8082',
      // Seat service — port 8083
      '/seats': 'http://localhost:8083',
      // Booking service — port 8084
      '/bookings': 'http://localhost:8084',
      // Passenger service — port 8085
      '/passengers': 'http://localhost:8085',
      // Payment service — port 8086
      '/payments': 'http://localhost:8086',
    },
  },
})
