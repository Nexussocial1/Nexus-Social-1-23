import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Satisfies the Gemini SDK's expectation of process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_API_KEY),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});