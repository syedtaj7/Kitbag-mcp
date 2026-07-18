import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.zip_extract', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
