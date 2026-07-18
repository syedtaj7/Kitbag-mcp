import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('developer.code_detector', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
