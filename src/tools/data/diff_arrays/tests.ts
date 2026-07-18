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

  // Test with key
  const result = await tool.handler({ arrayA, arrayB, key: "id" });
  assert.strictEqual(result.addedCount, 1);
  assert.strictEqual(result.deletedCount, 1);
  assert.strictEqual(result.modifiedCount, 1);
  assert.strictEqual(result.added[0].name, "Charlie");
  assert.strictEqual(result.deleted[0].name, "Bob");
  assert.strictEqual(result.modified[0].after.name, "Alice Modified");

  // Test invalid JSON
  await assert.rejects(
    async () => {
      await tool.handler({ arrayA: "{invalid", arrayB });
    },
    /Failed to parse inputs as JSON/
  );

  // Test non-array input
  await assert.rejects(
    async () => {
      await tool.handler({ arrayA: "{}", arrayB });
    },
    /Both arrayA and arrayB must be JSON arrays/
  );

  // Test without key
  const resultNoKey = await tool.handler({
    arrayA: JSON.stringify([1, 2, 3]),
    arrayB: JSON.stringify([2, 3, 4])
  });
  assert.strictEqual(resultNoKey.addedCount, 1);
  assert.strictEqual(resultNoKey.deletedCount, 1);
  assert.strictEqual(resultNoKey.unchangedCount, 2);

  // Test with key, but missing key in objects (fallbacks to full stringify)
  const resultKeyMismatch = await tool.handler({
    arrayA: JSON.stringify([{ age: 10 }]),
    arrayB: JSON.stringify([{ age: 10 }, { age: 20 }]),
    key: "id"
  });
  assert.strictEqual(resultKeyMismatch.addedCount, 1);
  assert.strictEqual(resultKeyMismatch.unchangedCount, 1);
}
