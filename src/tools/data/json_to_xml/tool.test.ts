import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('data.json_to_xml', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
