import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    cors: { origin: "*" },
    proxy: {
      "/api/solardata/enphase": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
      "/api/email/register": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
      "/api/email/verify": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
      "/api/livedata/status": {
        target: "http://localhost:8788",
        changeOrigin: true,
      }
    }
  },
})
