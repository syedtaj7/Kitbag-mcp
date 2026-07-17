import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const jsonA = JSON.stringify({
    id: 1,
    profile: {
      name: "Alice",
      age: 25
    }
  });
  
  const jsonB = JSON.stringify({
    id: 1,
    profile: {
      name: "Alice Modified",
      email: "alice@example.com"
    }
  });

  const result = await tool.handler({ jsonA, jsonB });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.hasChanges, true);
  assert.deepStrictEqual(result.added, ["profile.email"]);
  assert.deepStrictEqual(result.deleted, ["profile.age"]);
  assert.deepStrictEqual(result.modified, ["profile.name"]);
}
