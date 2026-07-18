import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.file_hash', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
