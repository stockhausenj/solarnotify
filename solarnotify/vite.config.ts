import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    cors: { origin: "*" },
    proxy: {
      "/api/setup": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
      "/api/register/email": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
      "/api/register/verify": {
        target: "http://localhost:8788",
        changeOrigin: true,
      }
    }
  },
})
