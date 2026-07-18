import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.base64_encode', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
