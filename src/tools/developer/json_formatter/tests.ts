import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const json = '{"name":"Alice","age":30}';
  const result = await tool.handler({ json });
  assert.strictEqual(result.success, true);
  assert.ok(result.formatted.includes('"name": "Alice"'));

  const minified = await tool.handler({ json, minify: true });
  assert.strictEqual(minified.formatted, '{"name":"Alice","age":30}');
}
