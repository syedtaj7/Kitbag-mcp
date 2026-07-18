import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('web.to_markdown', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
