import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const v4 = await tool.handler({ type: "v4" });
  assert.strictEqual(v4.success, true);
  assert.strictEqual(v4.type, "uuid-v4");
  assert.strictEqual(v4.value.length, 36);

  const pwd = await tool.handler({ type: "password", length: 24 });
  assert.strictEqual(pwd.success, true);
  assert.strictEqual(pwd.type, "secure-password");
  assert.strictEqual(pwd.value.length, 24);
}
