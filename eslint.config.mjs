import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // TypeScript handles undefined-symbol checking; disable the JS rule so
    // browser/node globals don't produce false positives.
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // RULES.md: no `this` anywhere in client code (only exception is
    // subclassing Error, which we never do here).
    files: ['client/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'ThisExpression', message: 'No `this` allowed in client code.' },
      ],
    },
  },
);
