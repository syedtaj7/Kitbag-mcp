import { describe, it } from 'vitest';
import { runTests } from './tests.js';

describe('web.youtube_transcript', () => {
  it('passes all tool-specific tests', async () => {
    await runTests();
  });
});
