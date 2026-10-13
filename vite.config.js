import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // Pure logic only (geometry, catalog, editor state): no DOM needed.
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}']
  }
})
