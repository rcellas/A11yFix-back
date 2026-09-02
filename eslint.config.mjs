import js from '@eslint/js';
import tsPlugin from 'typescript-eslint';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Hexagonal boundary rule: src/domain must be 100% pure TypeScript
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@nestjs/*',
                '@nestjs',
                'playwright',
                '@playwright/*',
                'axe-core',
                '@axe-core/*',
                'better-sqlite3',
                '@infrastructure/*',
                '../infrastructure/*',
                '../../infrastructure/*',
                '@application/*',
                '../application/*',
                '../../application/*',
              ],
              message: 'Domain layer must NEVER import from Application, Infrastructure, or framework libraries.',
            },
          ],
        },
      ],
    },
  },
  {
    // Hexagonal boundary rule: src/application must only depend on Domain and Ports
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@nestjs/*',
                '@nestjs',
                'playwright',
                '@playwright/*',
                'axe-core',
                '@axe-core/*',
                'better-sqlite3',
                '@infrastructure/*',
                '../infrastructure/*',
                '../../infrastructure/*',
              ],
              message: 'Application layer must NEVER import from Infrastructure or framework libraries.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.mjs'],
  },
];
