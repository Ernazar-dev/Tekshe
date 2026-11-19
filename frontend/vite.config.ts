import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    port: 5173,
    // Lokal islewde /api sorawları backend'ke jiberiledi
    proxy: { '/api': 'http://localhost:4000' },
  },
});
