import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const url = "https://google.com/search?q=mcp&hl=en#top";
  const result = await tool.handler({ url });
  
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.protocol, "https:");
  assert.strictEqual(result.hostname, "google.com");
  assert.strictEqual(result.pathname, "/search");
  assert.strictEqual(result.searchParams.q, "mcp");
  assert.strictEqual(result.searchParams.hl, "en");
  assert.strictEqual(result.hash, "#top");
}
