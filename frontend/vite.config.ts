import { defineConfig } from 'vite'

// Static single-file app (index.html). In dev, /api calls are proxied to the
// Python backend so the browser only ever talks to one origin.
export default defineConfig({
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
})
