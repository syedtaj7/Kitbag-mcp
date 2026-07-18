import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/tests/**',
        'src/server.ts',
        '**/*.test.ts',
        '**/tests.ts',
        'src/types.d.ts'
      ],
      reporter: ['text', 'json', 'html'],
    },
  },
});
