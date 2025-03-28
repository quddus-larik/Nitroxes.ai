import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': 'http://localhost:5000',
      '/sign-in': 'http://localhost:5000',
      '/save-chat': 'http://localhost:5000'
    }
  }
})
