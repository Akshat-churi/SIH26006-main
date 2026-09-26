import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import apiRouter from './server/api.js';

// Custom plugin to mount the API router inside Vite dev server
function astraApiPlugin() {
  return {
    name: 'astra-api-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json());
      app.use('/api', apiRouter);
      app.use(apiRouter);
      server.middlewares.use(app);
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    astraApiPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Exposes to local network so other laptops on Wi-Fi can connect
    open: true,
  },
  build: {
    sourcemap: false,
  },
  esbuild: {
    sourcemap: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    }
  }
});
