const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname),
  verbose: true,
  testURL: 'http://localhost/',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '__fixtures__'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
}
