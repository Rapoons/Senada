import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import App from './App'
import { AuthProvider } from './lib/auth'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user": hormati pengaturan "kurangi gerakan" di sistem operasi. */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <App />
        </AuthProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
