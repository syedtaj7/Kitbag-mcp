import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('pdf.split', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
