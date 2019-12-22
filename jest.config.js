// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/* 
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".spec.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
  
  */

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  collectCoverageFrom: ['**/src/**/*.js', '**/src/**/*.ts', '!**/build/**/*'],
  coverageDirectory: path.join(__dirname, './coverage'),

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/', '.*/__tests__/.*'],

  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: null,

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: null,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: null,

  // A set of global variables that need to be available in all test environments
  // globals: {},

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ['node_modules', 'test', 'src'],
  // moduleNameMapper: {
  //   '^src/(.*)': '<rootDir>/$1',
  // },

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'ts', 'json'],

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The root directory that Jest should scan for tests and modules within
  rootDir: 'src',

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFilesAfterEnv: [require.resolve('./test/setup-env')],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**',
    '**/?(*.)+(spec|test).ts?(x)',
    // '!**/build/**/*',
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['/node_modules/', '/build/'],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  watchPlugins: [
    require.resolve('jest-watch-select-projects'),
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
};
