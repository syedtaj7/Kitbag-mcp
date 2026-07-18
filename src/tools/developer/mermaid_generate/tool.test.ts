import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('developer.mermaid_generate', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
