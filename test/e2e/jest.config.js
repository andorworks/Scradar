export default {
  preset: 'jest-puppeteer',
  testMatch: ['**/*.e2e.test.js'],
  testTimeout: 30000,
  transform: {
    '^.+\\.js$': ['babel-jest', { 
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]] 
    }]
  }
};
