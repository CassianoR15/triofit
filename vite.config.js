import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// build: 2026-04-04
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})
