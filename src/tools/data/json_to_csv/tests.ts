import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const jsonData = JSON.stringify([
    { name: "Alice", age: 30, city: "New York" },
    { name: "Bob", age: 25, city: "San Francisco" }
  ]);

  const result = await tool.handler({ jsonData });
  assert.ok(result.csv.includes("name,age,city"));
  assert.ok(result.csv.includes("Alice,30,New York"));
  assert.ok(result.csv.includes("Bob,25,San Francisco"));
}
