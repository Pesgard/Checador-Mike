import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Disable type checking in esbuild to avoid TypeScript errors during build
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  build: {
    // Don't fail build on TypeScript errors
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress specific warnings
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        warn(warning)
      }
    }
  }
})
