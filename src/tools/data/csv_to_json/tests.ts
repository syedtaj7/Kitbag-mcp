import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const csvData = "name,age,city\nAlice,30,New York\nBob,25,San Francisco";
  const result = await tool.handler({ csvData });
  assert.strictEqual(result.count, 2);
  assert.deepStrictEqual(result.data[0], { name: "Alice", age: "30", city: "New York" });
  assert.deepStrictEqual(result.data[1], { name: "Bob", age: "25", city: "San Francisco" });

  const resultNoColumns = await tool.handler({ csvData, columns: false });
  assert.strictEqual(resultNoColumns.count, 3); // header + 2 data rows
  assert.deepStrictEqual(resultNoColumns.data[0], ["name", "age", "city"]);
}
