import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './routes'
import { GoogleAuthProvider } from './lib/google-auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleAuthProvider>
      <AppRoutes />
    </GoogleAuthProvider>
  </StrictMode>,
)
