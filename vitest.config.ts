import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'shared/src/**/*.ts',
        'server/src/**/*.ts',
        'client/src/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        'client/src/main.tsx',
      ],
      thresholds: {
        statements: 75,
        functions: 75,
        lines: 75,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@red-tetris/shared': resolve(__dirname, 'shared/src'),
    },
  },
});
