import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const managementTarget = process.env.VITE_MANAGEMENT_URL || process.env.MANAGEMENT_URL || 'http://localhost:8081';
const gatewayTarget = process.env.VITE_GATEWAY_URL || process.env.GATEWAY_URL || 'http://localhost:8080';
const analyticsTarget = process.env.VITE_ANALYTICS_URL || process.env.ANALYTICS_URL || 'http://localhost:8082';

const proxyConfig = {
  '/api/v1/auth': {
    target: managementTarget,
    changeOrigin: true,
  },
  '/api/v1/routes': {
    target: managementTarget,
    changeOrigin: true,
  },
  '/api/v1/organizations': {
    target: managementTarget,
    changeOrigin: true,
  },
  '/api/v1/audit-records': {
    target: managementTarget,
    changeOrigin: true,
  },
  '/api/v1/internal': {
    target: managementTarget,
    changeOrigin: true,
  },
  '/api/v1/mock': {
    target: managementTarget,
    changeOrigin: true,
  },
  '/gateway': {
    target: gatewayTarget,
    changeOrigin: true,
  },
  '/echo': {
    target: gatewayTarget,
    changeOrigin: true,
  },
  '/delay': {
    target: gatewayTarget,
    changeOrigin: true,
  },
  '/api/v1/analytics': {
    target: analyticsTarget,
    changeOrigin: true,
  },
};

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
    proxy: proxyConfig,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    proxy: proxyConfig,
  },
});
