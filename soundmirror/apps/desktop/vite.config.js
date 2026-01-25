import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Tauri expects a fixed port
  server: {
    port: 5173,
    strictPort: true,
  },
  
  // Use relative paths for Tauri
  base: './',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, '../../core'),
    },
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    minify: 'esbuild',
  },
  
  // Don't clear screen for Tauri logs
  clearScreen: false,
});
