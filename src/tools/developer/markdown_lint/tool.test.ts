import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('developer.markdown_lint', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
