import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('developer.diff_json', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
