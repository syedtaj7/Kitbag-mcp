import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.ssl_check', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
