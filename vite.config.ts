import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import { apiMiddleware } from './server/apiHandler.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use(apiMiddleware)
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  }
})
