import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const expression = "*/15 * * * *";
  const result = await tool.handler({ expression, iterations: 3 });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.nextExecutions.length, 3);
  
  await assert.rejects(async () => {
    await tool.handler({ expression: "invalid-cron-expr" });
  });
}
