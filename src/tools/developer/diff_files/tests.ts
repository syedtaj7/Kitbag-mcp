import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const contentA = "line 1\nline 2\nline 3";
  const contentB = "line 1\nline 2 modified\nline 3\nline 4 added";

  const result = await tool.handler({ contentA, contentB });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.addedLines, 2);
  assert.strictEqual(result.deletedLines, 1);
  assert.ok(result.diff.includes("- line 2"));
  assert.ok(result.diff.includes("+ line 2 modified"));
  assert.ok(result.diff.includes("+ line 4 added"));
}
