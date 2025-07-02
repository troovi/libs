import { defineConfig } from 'vite'
import typescript from '@rollup/plugin-typescript'

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      name: 'transmit',
      fileName: (format) => `bundle.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' }
      },
      plugins: [
        typescript({
          tsconfig: './tsconfig.json',
          noEmitOnError: true
        })
      ]
    }
  }
})
