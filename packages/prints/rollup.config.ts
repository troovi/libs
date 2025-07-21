import eslint from '@rollup/plugin-eslint'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import strip from '@rollup/plugin-strip'
import autoExternal from 'rollup-plugin-auto-external'
import postcss from 'rollup-plugin-postcss'

// не используем @rollup/plugin-node-resolve чтобы rollup не имел доступа к коду react/jsx-runtime, чтобы избежать его добавления в бандл

export default [
  // CommonJS (cjs) build
  {
    input: './src/index.ts',
    output: {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      globals: { react: 'React', 'react-dom': 'ReactDOM' }
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'], // добавим 'react/jsx-runtime' как external, чтобы rollup не выводил предупреждение о unresolved dependencies
    plugins: [
      eslint({
        include: ['./src/**/*.ts', './src/**/*.tsx']
      }),
      typescript({ tsconfig: './tsconfig.json', noEmitOnError: true }),
      autoExternal(),
      postcss({ extract: 'styles.css', minimize: true }),
      strip(),
      terser()
    ]
  }
]
