import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/issue-1/',
  server: {
    port: 5173,
  },
  define: {
    global: 'globalThis',
  },
});
