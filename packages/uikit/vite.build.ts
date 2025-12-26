import { defineConfig } from 'vite'
import autoExternal from 'rollup-plugin-auto-external'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import dts from 'vite-plugin-dts'
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Custom plugin to copy SCSS files
function copyScssFiles() {
  return {
    name: 'copy-scss-files',
    closeBundle() {
      const srcDir = join(__dirname, 'src')
      const distDir = join(__dirname, 'dist')

      function copyRecursive(src: string, dest: string) {
        const entries = readdirSync(src)

        for (const entry of entries) {
          const srcPath = join(src, entry)
          const destPath = join(dest, entry)
          const stat = statSync(srcPath)

          if (stat.isDirectory()) {
            if (!existsSync(destPath)) {
              mkdirSync(destPath, { recursive: true })
            }
            copyRecursive(srcPath, destPath)
          } else if (entry.endsWith('.scss')) {
            const destDir = dirname(destPath)
            if (!existsSync(destDir)) {
              mkdirSync(destDir, { recursive: true })
            }
            copyFileSync(srcPath, destPath)
          }
        }
      }

      copyRecursive(srcDir, distDir)
    }
  }
}

export default defineConfig({
  plugins: [
    dts({
      exclude: './playground'
      // outDir: 'dist'
    }),
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
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'], // vite работает поверх rollup, и использует @rollup/plugin-node-resolve как встроенную часть загрузки модулей, в результате чего код 'react/jsx-runtime' дублируется в бандл
      output: {
        preserveModules: true, // без указанного sideEffects в бандле клиента оказались бы компоненты обернутые в forwardRef,
        //                        поскольку webpack не мог бы определить является ли forwardRef side-эффект функцией воздействующей на окружение.
        //                        Модульная сборка + sideEffects: false позволяют клиенту получать код только явно импортируемых функций
        globals: { react: 'React', 'react-dom': 'ReactDOM' }
      },
      plugins: [autoExternal(), copyScssFiles()]
    }
  }
})
