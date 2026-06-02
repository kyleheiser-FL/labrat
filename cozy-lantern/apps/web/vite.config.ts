import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@circlsquad/shared': new URL('../../packages/shared/src/index.ts', import.meta.url).pathname,
    },
  },
});
