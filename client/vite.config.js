import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Saat dev, permintaan /api diteruskan ke server Express (tanpa masalah CORS).
  server: { proxy: { '/api': 'http://localhost:4000', '/uploads': 'http://localhost:4000' } },
})
