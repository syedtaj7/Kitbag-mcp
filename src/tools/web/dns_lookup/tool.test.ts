import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('web.dns_lookup', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
