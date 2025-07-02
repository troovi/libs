import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: `eslint "./**/*.{ts,tsx}"`
      }
    })
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      name: 'uikit',
      fileName: (format) => `bundle.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // external: ['lightweight-charts']
    }
  }
})
