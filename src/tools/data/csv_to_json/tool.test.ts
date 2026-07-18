import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('data.csv_to_json', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
