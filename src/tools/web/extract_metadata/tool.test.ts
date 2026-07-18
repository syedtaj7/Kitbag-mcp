import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('web.extract_metadata', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
