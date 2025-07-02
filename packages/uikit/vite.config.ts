import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import { resolve } from 'path'

export default defineConfig({
  // Project root directory (where index.html is located).
  root: '.', // Можно было бы указать .html в playground, но тогда eslint работал бы нестабильно со смежными директориями. Путь в lintCommand относителен от 'root' пути
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: `eslint "./**/*.{ts,tsx}"`
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
