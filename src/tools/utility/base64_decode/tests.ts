import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const base64 = "TUNQIFNlcnZlciBUb29sYm94";
  const result = await tool.handler({ base64 });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.text, "MCP Server Toolbox");
  assert.strictEqual(result.sizeBytes, 18);
}
