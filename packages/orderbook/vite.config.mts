import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import tailwindcss from '@tailwindcss/vite'

import { resolve } from 'path'

export default defineConfig({
  root: '.', // Можно было бы указать .html в playground, но тогда eslint работал бы нестабильно со смежными директориями. Путь в lintCommand относителен от 'root' пути
  plugins: [
    react(),
    tailwindcss(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: `eslint "./**/*.{ts,tsx}"`
      }
    })
  ],
  server: {
    hmr: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
