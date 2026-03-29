module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integrations'],
  testMatch: ['**/cases.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test-app.json'
      }
    ]
  }
}
