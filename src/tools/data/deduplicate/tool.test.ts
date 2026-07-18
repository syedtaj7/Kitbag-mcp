import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('data.deduplicate', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
