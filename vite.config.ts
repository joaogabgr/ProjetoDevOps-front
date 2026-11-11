import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Em desenvolvimento, /api vai para a API local (repositório back, porta 3000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
