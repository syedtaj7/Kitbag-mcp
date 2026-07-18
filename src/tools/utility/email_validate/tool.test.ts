import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('utility.email_validate', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
