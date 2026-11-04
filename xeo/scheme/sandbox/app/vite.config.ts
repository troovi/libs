import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const SERVER = 'http://localhost:4500'

/**
 * Библиотеку xeo каждая версия берёт сама — пакетами своего `package.json` (`versions/<version>`), обычным
 * разрешением модулей, без алиасов. uikit и formkit — из исходников, как в песочнице uikit: тема `themes/classic`
 * копит токены в карте модуля `src/theme.scss`, и компоненты должны собираться из той же `src`. Алиас — только на
 * точное имя пакета: стили подключаются путями `@companix/uikit/...`.
 */
const alias = [
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
