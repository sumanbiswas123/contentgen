import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log("DEBUG: VITE_SERVER_URL =", env.VITE_SERVER_URL);
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            editors: ['@monaco-editor/react', 'react-quill'],
          },
        },
      },
    },
    server: {
      port: 3000,
      open: false,
    },
    define: {
      global: 'globalThis',
      'process.env.REACT_APP_SERVER_URL': JSON.stringify(env.VITE_SERVER_URL || 'http://10.215.56.196:9000'),
    },
  };
});
