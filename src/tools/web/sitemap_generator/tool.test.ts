import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('web.sitemap_generator', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
