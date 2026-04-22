module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'vue'],
  transform: {
    '.*\\.vue$': 'vue-jest',
    '.*\\.ts$': 'ts-jest'
  },
  testRegex: '.*/.*\\.spec\\.ts$',
  modulePathIgnorePatterns: [
    '<rootDir>/.tmp/',
    '<rootDir>/.tools/',
    '<rootDir>/dist_electron/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
