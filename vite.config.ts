import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // relative asset paths so the build works when served from a nested path
  // (preview proxy) as well as a domain root (Vercel)
  base: './',
  plugins: [react()],
})
