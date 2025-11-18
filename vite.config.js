import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        donate: resolve(__dirname, 'donate.html'),
        sent: resolve(__dirname, 'sent.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
