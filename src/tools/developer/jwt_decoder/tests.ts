import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4MDAwMDAwMDB9.dummy-sig";
  const result = await tool.handler({ token });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.header.alg, "HS256");
  assert.strictEqual(result.payload.name, "John Doe");
  assert.strictEqual(result.isExpired, false);
}
