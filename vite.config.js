import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Runs on 5174 so it can sit alongside the storefront on 5173.
// The proxy means the browser sees same-origin /api and you never hit CORS
// in development. In production, serve this build from the same domain or
// add the admin origin to the API's cors() allowlist.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
