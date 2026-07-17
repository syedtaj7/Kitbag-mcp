import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const jsonData = JSON.stringify({
    name: "Alice",
    age: 30,
    skills: ["coding", "design"]
  });

  const result = await tool.handler({ jsonData });
  assert.strictEqual(result.success, true);
  assert.ok(result.yaml.includes("name: Alice"));
  assert.ok(result.yaml.includes("- coding"));
}
