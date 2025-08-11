// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const baseConfig = {
  external: ['react', 'vue'],
  plugins: [
    nodeResolve(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
};

export default [
  // Main ESM build
  {
    ...baseConfig,
    input: 'src/index.js',
    output: {
      file: 'dist/scradar.esm.js',
      format: 'es'
    }
  },
  // Main UMD build
  {
    ...baseConfig,
    input: 'src/index.js',
    output: {
      file: 'dist/scradar.umd.js',
      format: 'umd',
      name: 'Scradar'
    }
  },
  // Minified UMD build
  {
    ...baseConfig,
    input: 'src/index.js',
    output: {
      file: 'dist/scradar.min.js',
      format: 'umd',
      name: 'Scradar'
    },
    plugins: [
      ...baseConfig.plugins,
      terser()
    ]
  },
  // React framework build
  {
    ...baseConfig,
    input: 'frameworks/react/index.js',
    output: {
      file: 'dist/react.esm.js',
      format: 'es'
    }
  },
  // Vue framework build
  {
    ...baseConfig,
    input: 'frameworks/vue/index.js',
    output: {
      file: 'dist/vue.esm.js',
      format: 'es'
    }
  }
];
