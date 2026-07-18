import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('web.rss_parser', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
