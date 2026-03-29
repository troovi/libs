import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import strip from '@rollup/plugin-strip'
import autoExternal from 'rollup-plugin-auto-external'
import replace from '@rollup/plugin-replace'

export default [
  // EcmaScript Module (esm) build
  {
    input: './lib/index.ts',
    output: {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    },
    external: ['react', 'react-dom'],
    plugins: [
      replace({
        preventAssignment: true,
        'globalThis.__DEV__': 'false'
      }),
      typescript({ tsconfig: './tsconfig.build.json', noEmitOnError: true }),
      autoExternal(),
      resolve(),
      strip(),
      terser()
    ]
  },
  // CommonJS (cjs) build
  {
    input: './lib/index.ts',
    output: {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    external: ['react', 'react-dom'],
    plugins: [
      replace({
        preventAssignment: true,
        'globalThis.__DEV__': 'false'
      }),
      typescript({ tsconfig: './tsconfig.build.json', noEmitOnError: true }),
      autoExternal(),
      resolve(),
      strip(),
      terser()
    ]
  }
]
