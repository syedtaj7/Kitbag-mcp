import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  // Test default range [1, 100]
  const res = await tool.handler({});
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.min, 1);
  assert.strictEqual(res.max, 100);
  assert.ok(res.value >= 1 && res.value <= 100);

  // Test custom range [5, 5]
  const resSingle = await tool.handler({ min: 5, max: 5 });
  assert.strictEqual(resSingle.value, 5);

  // Test invalid range [10, 5] (should throw error)
  await assert.rejects(
    async () => {
      await tool.handler({ min: 10, max: 5 });
    },
    /Minimum value \(10\) cannot be greater than maximum value \(5\)/
  );
}
