import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('image.resize', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
