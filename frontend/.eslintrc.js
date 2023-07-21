module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    crypto: 'readonly',
    window: 'readonly',
  },
  plugins: ['@typescript-eslint', 'jest', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    'jest/expect-expect': [
      'warn',
      {
        '@typescript-eslint/no-explicit-any': ['warn', {ignoreRestArgs: true}],
      },
      {
        // ensure, that react tests are recognized as assertions
        assertFunctionNames: [
          'expect',
          'screen.getBy*',
          'screen.getAllBy*',
          'screen.queryBy*',
          'screen.queryAllBy*',
          'screen.findBy*',
          'screen.findAllBy*',
        ],
      },
    ],
  },
};
