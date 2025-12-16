import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const config = [
  {
    ignores: [
      'venv/**',
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'max-len': ['warn', { 'code': 100, 'ignoreUrls': true, 'ignoreStrings': true }],
      'indent': ['warn', 2],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-restricted-imports': [
        'error',
        {
          'patterns': [
            {
              'group': ['../*'],
              'message': 'Use @/* path aliases instead of relative imports that traverse directories. See tsconfig.json paths.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'max-len': ['warn', { 'code': 100, 'ignoreUrls': true, 'ignoreStrings': true }],
      'indent': ['warn', 2],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-restricted-imports': [
        'error',
        {
          'patterns': [
            {
              'group': ['../*'],
              'message': 'Use @/* path aliases instead of relative imports that traverse directories. See tsconfig.json paths.',
            },
          ],
        },
      ],
    },
  },
];

export default config;
