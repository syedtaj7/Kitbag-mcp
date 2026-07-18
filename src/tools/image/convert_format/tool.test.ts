import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('image.convert_format', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
