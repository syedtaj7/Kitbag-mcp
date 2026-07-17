import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const regex = "(\\w+)@(\\w+\\.\\w+)";
  const text = "email is alice@example.com";
  
  const result = await tool.handler({ regex, text });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.hasMatch, true);
  assert.strictEqual(result.matchCount, 1);
  assert.strictEqual(result.matches[0].match, "alice@example.com");
  assert.deepStrictEqual(result.matches[0].groups, ["alice", "example.com"]);
}
