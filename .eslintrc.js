module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    // '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    // '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/interface-name-prefix': 0,
  },
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/?(*.)+(spec|test).ts?(x)'],
      settings: {
        'import/resolver': {
          jest: {
            jestConfigFile: require.resolve('./jest.config.js'),
          },
        },
      },
    },
  ],
  ignorePatterns: ['build/', 'dist/', 'coverage', 'graphql.classes.ts'],
};
