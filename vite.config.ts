import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],

  server: {
    proxy: {

      '/auth': {
        target:
            'http://localhost:3000',

        changeOrigin: true
      },

      '/library': {
        target:
            'http://localhost:3000',

        changeOrigin: true
      },

      '/google': {
        target:
            'http://localhost:3000',

        changeOrigin: true
      },

      '/health': {
        target:
            'http://localhost:3000',

        changeOrigin: true
      }

    }
  }
});