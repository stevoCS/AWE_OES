import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable Fast Refresh
    fastRefresh: true,
    // Force refresh on route changes
    include: "**/*.{jsx,tsx}",
  })],
  server: {
    // Ensure all routes fall back to index.html for SPA
    historyApiFallback: true,
    // Force reload on changes
    hmr: {
      overlay: true
    }
  },
  // Ensure proper handling of dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
