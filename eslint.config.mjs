import js from '@eslint/js';
import react from 'eslint-plugin-react';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      // Provide browser and Node globals so ESLint doesn't flag them as undefined
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
    },
    rules: {
      ...(ts.configs.recommended?.rules || {}),
      ...(react.configs.recommended?.rules || {}),
      ...(react.configs['jsx-runtime']?.rules || {}),
      // Handled by TypeScript type-checker; recommended to disable in TS files
      'no-undef': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
  // Disable formatting-related lint rules and defer to Prettier
  prettier,
];
