import { defineConfig } from 'vite'
import typescript from '@rollup/plugin-typescript'
import dtsPlugin from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dtsPlugin({ exclude: './playground' })],
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
