import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('data.diff_arrays', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
