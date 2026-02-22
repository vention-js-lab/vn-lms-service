/** @type {import('ts-jest').JestConfigWithTsJest} **/
const config = {
  // ==== Base ==== //
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  passWithNoTests: true,

  // ====  Paths ==== //
  rootDir: 'src',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^#/(.*)$': '<rootDir>/$1',
  },

  // ==== Coverage ==== //
  coverageDirectory: './coverage',
  collectCoverageFrom: ['**/*.(t|j)s'],
};

export default config;
