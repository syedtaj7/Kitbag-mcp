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

  // Test invalid JSON
  await assert.rejects(
    async () => {
      await tool.handler({ arrayData: "{invalid" });
    },
    /Failed to parse arrayData as JSON/
  );

  // Test non-array input
  await assert.rejects(
    async () => {
      await tool.handler({ arrayData: "{}" });
    },
    /Input arrayData must be a JSON array/
  );

  // Test key mismatch (items without key)
  const resultMissingKey = await tool.handler({
    arrayData: JSON.stringify([
      { age: 10 },
      { age: 10 }
    ]),
    key: "id"
  });
  assert.strictEqual(resultMissingKey.deduplicatedCount, 1);

  // Test array with objects comparison by identity
  const resultObjIdentity = await tool.handler({
    arrayData: JSON.stringify([
      { id: 1 },
      { id: 1 },
      { id: 2 }
    ])
  });
  assert.strictEqual(resultObjIdentity.deduplicatedCount, 2);
}
