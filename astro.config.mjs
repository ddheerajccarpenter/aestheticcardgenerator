import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aestheticcardstudio.com',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
            if (id.includes('node_modules/lucide-react/')) return 'vendor-icons';
            if (id.includes('node_modules/three/')) return 'vendor-three';
            if (id.includes('node_modules/html-to-image/') || id.includes('node_modules/canvas-confetti/')) return 'vendor-canvas';
          },
        },
      },
    },
    server: { port: 3000, open: false },
  },
});
