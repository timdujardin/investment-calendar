import js from '@eslint/js';
import * as depend from 'eslint-plugin-depend';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'scripts', 'workers']),

  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],

      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'const', next: 'return' },
        { blankLine: 'always', prev: 'let', next: 'return' },
        { blankLine: 'always', prev: 'if', next: 'return' },
        { blankLine: 'always', prev: 'block', next: 'return' },
      ],
      curly: ['error', 'all'],
      'object-shorthand': 'error',
      'nonblock-statement-body-position': ['error', 'below'],
      'no-constant-binary-expression': 'error',

      'react/button-has-type': 'error',
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/jsx-no-constructed-context-values': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/void-dom-elements-no-children': 'error',
      'react/no-object-type-as-default-prop': 'error',
    },
  },

  sonarjs.configs.recommended,
  {
    rules: {
      'sonarjs/fixme-tag': 'warn',
      'sonarjs/todo-tag': 'warn',
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/function-return-type': 'off',
    },
  },

  reactYouMightNotNeedAnEffect.configs.recommended,

  {
    ...depend.configs['flat/recommended'],
    rules: {
      ...depend.configs['flat/recommended'].rules,
      'depend/ban-dependencies': ['error', { allowed: ['eslint-plugin-react'] }],
    },
  },

  {
    files: ['**/contexts/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
