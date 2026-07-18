import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('pdf.convert_to_text', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
