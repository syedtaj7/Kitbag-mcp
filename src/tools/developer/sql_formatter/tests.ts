import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const sql = "select a,b from c where d=1";
  const result = await tool.handler({ sql, dialect: "sql" });
  assert.strictEqual(result.success, true);
  assert.ok(result.formatted.includes("SELECT"));
  assert.ok(result.formatted.includes("FROM"));
  assert.ok(result.formatted.includes("WHERE"));
}
