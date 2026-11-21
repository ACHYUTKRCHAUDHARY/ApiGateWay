import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/routes': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/organizations': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/audit-records': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/internal': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/mock': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/gateway': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/v1/analytics': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
});
