import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.unit_convert', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
