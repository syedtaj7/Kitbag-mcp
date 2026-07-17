import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const yaml = `
    users:
      - name: Alice
        age: 30
      - name: Bob
        age: 25
  `;

  const result = await tool.handler({ yaml });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.users.length, 2);
  assert.strictEqual(result.data.users[0].name, "Alice");
  assert.strictEqual(result.data.users[1].age, 25);
}
