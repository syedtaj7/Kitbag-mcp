import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const arrayData = JSON.stringify([
    { id: 1, name: "Alice" },
    { id: 1, name: "Alice Duplicate" },
    { id: 2, name: "Bob" }
  ]);

  const result = await tool.handler({ arrayData, key: "id" });
  assert.strictEqual(result.deduplicatedCount, 2);
  assert.strictEqual(result.removedCount, 1);
  assert.strictEqual(result.data[0].name, "Alice");

  const resultIdentity = await tool.handler({ arrayData: JSON.stringify(["a", "b", "a"]) });
  assert.deepStrictEqual(resultIdentity.data, ["a", "b"]);
}
