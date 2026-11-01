import { defineConfig } from 'vite'
import autoExternal from 'rollup-plugin-auto-external'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import dtsPlugin from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: `eslint "./**/*.{ts,tsx}"`
      }
    }),
    dtsPlugin({ exclude: './playground' })
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      name: 'statekit',
      fileName: (format) => `bundle.${format}.js`,
      // cjs — для node (тесты, сервер): без `main` пакет в node не находится
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // 'react/jsx-runtime' иначе попадает в бандл копией
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' }
      },
      plugins: [autoExternal()]
    }
  }
})
