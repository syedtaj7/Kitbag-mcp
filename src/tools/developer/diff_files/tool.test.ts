import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('developer.diff_files', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
