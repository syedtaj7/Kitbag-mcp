import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('developer.sql_formatter', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
