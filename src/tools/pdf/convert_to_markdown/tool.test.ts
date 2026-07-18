import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('pdf.convert_to_markdown', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
