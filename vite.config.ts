import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client SPA lives under client/. In production the server serves the
// built assets from dist/client. In dev, Socket.IO traffic is proxied to the
// Node server so the browser always talks to the same origin.
export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
});
