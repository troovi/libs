import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

/** Песочница пакета: `index.html` в корне пакета и `playground/`. */
export default defineConfig({
  // корень — сам пакет: так eslint в checker стабильно видит смежные директории
  root: '.',
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: `eslint "./**/*.{ts,tsx}"`
      }
    })
  ]
})
