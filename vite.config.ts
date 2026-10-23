/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The lazy 3D chunk (three.js) is big by nature; it loads only on the home page
    chunkSizeWarningLimit: 1100,
  },
  test: {
    // Only pure logic is tested (see CLAUDE.md)
    include: ['src/lib/**/*.test.ts'],
  },
})
