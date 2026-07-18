import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('ai.text_chunker', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
