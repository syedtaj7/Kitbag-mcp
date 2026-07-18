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

  // Test default type (omitted)
  const defaultRes = await tool.handler({});
  assert.strictEqual(defaultRes.type, "uuid-v4");

  // Test default password length
  const defaultPwd = await tool.handler({ type: "password" });
  assert.strictEqual(defaultPwd.value.length, 16);

  // Test v1 UUID
  const v1 = await tool.handler({ type: "v1" });
  assert.strictEqual(v1.type, "uuid-v1");
  assert.strictEqual(v1.value.length, 36);

  // Test unsupported type
  await assert.rejects(
    async () => {
      await tool.handler({ type: "invalid" });
    },
    /Unsupported type: invalid/
  );
}
