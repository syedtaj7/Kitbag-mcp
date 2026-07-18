import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.qr_generate', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
