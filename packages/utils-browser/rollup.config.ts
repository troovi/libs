import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import strip from '@rollup/plugin-strip'
import autoExternal from 'rollup-plugin-auto-external'

export default [
  // EcmaScript Module (esm) build
  {
    input: './src/index.ts',
    output: {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json', noEmitOnError: true }),
      autoExternal(),
      resolve(),
      strip(),
      terser()
    ]
  },
  // CommonJS (cjs) build
  {
    input: './src/index.ts',
    output: {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json', noEmitOnError: true }),
      autoExternal(),
      resolve(),
      strip(),
      terser()
    ]
  }
]
