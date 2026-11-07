import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: fs.realpathSync(process.cwd()),
  server: {
    port: 3000,
    allowedHosts: ['unpromptly-unrustic-albert.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
