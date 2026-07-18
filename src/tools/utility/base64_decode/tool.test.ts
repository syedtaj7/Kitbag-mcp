import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.base64_decode', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
