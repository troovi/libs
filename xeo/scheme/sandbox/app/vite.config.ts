import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const SERVER = 'http://localhost:4500'

/**
 * Библиотеки xeo — из исходников, а не из `dist`: правка `lib` видна в песочнице сразу, и экземпляр
 * `xeo-scheme` (хранилище метаданных моделей — модульный синглтон) один у всех пакетов. Точный путь
 * `schemaOf` стоит раньше общего префикса пакета: алиасы применяются по порядку.
 *
 * uikit и formkit — тоже из исходников, как в песочнице uikit: тема `themes/classic` копит токены в
 * карте модуля `src/theme.scss`, и компоненты должны собираться из той же `src`. Алиас — только на
 * точное имя пакета: стили подключаются путями `@companix/uikit/...`.
 */
const alias = [
  {
    find: '@companix/xeo-toolkit/dist/schemaOf',
    replacement: resolve(__dirname, '../../../toolkit/lib/schemaOf.ts')
  },
  {
    find: '@companix/xeo-toolkit',
    replacement: resolve(__dirname, '../../../toolkit/lib/index.ts')
  },
  {
    find: '@companix/xeo-scheme',
    replacement: resolve(__dirname, '../../lib/index.ts')
  },
  {
    find: '@companix/xeo-react',
    replacement: resolve(__dirname, '../../../react/lib/index.ts')
  },
  {
    find: /^@companix\/uikit$/,
    replacement: resolve(__dirname, '../../../../packages/uikit/src/index.ts')
  },
  {
    find: /^@companix\/formkit$/,
    replacement: resolve(__dirname, '../../../../packages/formkit/src/index.ts')
  }
]

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: { alias },
  define: { 'globalThis.__DEV__': 'false' },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
        quietDeps: true
      }
    }
  },
  server: {
    port: 4501,
    proxy: {
      '/api': { target: SERVER, rewrite: (path) => path.replace(/^\/api/, '') }
    }
  }
})
