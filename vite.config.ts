import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8088,
    // Enable HMR for better development experience
    hmr: true
  },
  plugins: [
    react()
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },

  // PWA Configuration
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },

  // Ensure service worker is copied during build
  publicDir: 'public'
}));
