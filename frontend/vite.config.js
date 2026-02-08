import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional: seteaza portul frontend-ului (sau lasa default 5173)
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // <--- AICI E CHEIA. Trebuie sa bata cu portul backend-ului
        changeOrigin: true,
        secure: false,
      },
    },
  },
})