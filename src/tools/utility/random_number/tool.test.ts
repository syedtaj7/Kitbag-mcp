import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.random_number', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
