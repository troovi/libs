import { defineConfig } from 'vite'
import autoExternal from 'rollup-plugin-auto-external'
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
      name: 'formkit',
      fileName: (format) => `bundle.${format}.js`,
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'], // vite работает поверх rollup, и использует @rollup/plugin-node-resolve как встроенную часть загрузки модулей, в результате чего код 'react/jsx-runtime' дублируется в бандл
      output: {
        preserveModules: true,
        globals: { react: 'React', 'react-dom': 'ReactDOM' }
      },
      plugins: [autoExternal()]
    }
  }
})
