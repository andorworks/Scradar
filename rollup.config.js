// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const config = {
  input: 'src/index.js',
  external: [],
  plugins: [
    nodeResolve(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
};

export default [
  // ESM build
  {
    ...config,
    output: {
      file: 'dist/scradar.esm.js',
      format: 'es'
    }
  },
  // UMD build
  {
    ...config,
    output: {
      file: 'dist/scradar.umd.js',
      format: 'umd',
      name: 'Scradar'
    }
  },
  // Minified UMD build
  {
    ...config,
    output: {
      file: 'dist/scradar.min.js',
      format: 'umd',
      name: 'Scradar'
    },
    plugins: [
      ...config.plugins,
      terser()
    ]
  }
];
