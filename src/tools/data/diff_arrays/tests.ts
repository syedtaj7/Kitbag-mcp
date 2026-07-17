import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const arrayA = JSON.stringify([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ]);
  const arrayB = JSON.stringify([
    { id: 1, name: "Alice Modified" },
    { id: 3, name: "Charlie" }
  ]);

  const result = await tool.handler({ arrayA, arrayB, key: "id" });
  assert.strictEqual(result.addedCount, 1);
  assert.strictEqual(result.deletedCount, 1);
  assert.strictEqual(result.modifiedCount, 1);
  assert.strictEqual(result.added[0].name, "Charlie");
  assert.strictEqual(result.deleted[0].name, "Bob");
  assert.strictEqual(result.modified[0].after.name, "Alice Modified");
}
