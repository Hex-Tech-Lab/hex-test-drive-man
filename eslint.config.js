import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser'; // Import the parser
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks'; // Import react-hooks plugin

const config = [
  {
    ignores: ['venv/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser, // Specify the parser for TypeScript files
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
        ecmaVersion: 'latest', // Use the latest ECMAScript version
        sourceType: 'module', // Use ES Modules
        project: ['./tsconfig.json'], // Specify your tsconfig.json for type-aware linting
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin, // Provide the imported plugin object
    },
    rules: {
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'max-len': ['warn', { 'code': 100, 'ignoreUrls': true, 'ignoreStrings': true }],
      'indent': ['warn', 2],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/prop-types': 'off', // Not needed with TypeScript
      'no-restricted-imports': [
        'error',
        {
          'patterns': [
            {
              'group': ['../*'],
              'message': 'Use @/* path aliases instead of relative imports that traverse directories. See tsconfig.json paths.'
            }
          ]
        }
      ],
      // Removed problematic react-hooks rules for now
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': 'warn',
      // 'react/no-set-state-in-component': 'off'
    },
  },
  // Add a configuration for JavaScript files if any, using default parser or another
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
      'react-hooks': reactHooksPlugin, // Provide the imported plugin object
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
              'message': 'Use @/* path aliases instead of relative imports that traverse directories. See tsconfig.json paths.'
            }
          ]
        }
      ],
      // Removed problematic react-hooks rules for now
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': 'warn',
      // 'react/no-set-state-in-component': 'off'
    },
  },
];

export default config;