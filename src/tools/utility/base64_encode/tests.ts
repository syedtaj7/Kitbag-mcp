import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const text = "MCP Server Toolbox";
  const result = await tool.handler({ text });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.base64, "TUNQIFNlcnZlciBUb29sYm94");
  assert.strictEqual(result.sizeBytes, text.length);
}
