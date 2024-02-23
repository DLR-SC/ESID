// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

const {screen} = require('@testing-library/react');
module.exports = {
  root: true,
  env: {browser: true, es2020: true},
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: '2020',
    ecmaFeatures: {
      jsx: true,
    },
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
  plugins: ['@typescript-eslint', 'vitest', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:vitest/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'vitest/expect-expect': [
      'warn',
      {
        assertFunctionNames: [
          'expect',
          'screen.getByText',
          'screen.findByText',
          'screen.getByAltText',
          'screen.getByLabelText',
          'screen.findByDisplayValue',
          'screen.getByPlaceholderText',
          'screen.findByPlaceholderText',
        ],
      },
    ],
  },
};
