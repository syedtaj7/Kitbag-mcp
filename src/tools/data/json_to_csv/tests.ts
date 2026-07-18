import { tool } from './tool.js';
import assert from 'assert';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runTests() {
  const jsonData = JSON.stringify([
    { name: "Alice", age: 30, city: "New York" },
    { name: "Bob", age: 25, city: "San Francisco" }
  ]);

  // Test raw JSON data
  const result = await tool.handler({ jsonData });
  assert.ok(result.csv.includes("name,age,city"));
  assert.ok(result.csv.includes("Alice,30,New York"));
  assert.ok(result.csv.includes("Bob,25,San Francisco"));

  // Test custom delimiter
  const resultCustom = await tool.handler({ jsonData, delimiter: ';' });
  assert.ok(resultCustom.csv.includes("name;age;city"));

  // Test filePath input
  const tempFile = path.join(__dirname, 'temp_json.json');
  fs.writeFileSync(tempFile, jsonData, 'utf8');
  try {
    const fileResult = await tool.handler({ filePath: tempFile });
    assert.ok(fileResult.csv.includes("name,age,city"));
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }

  // Test invalid JSON
  await assert.rejects(
    async () => {
      await tool.handler({ jsonData: "{invalid" });
    },
    /Failed to parse input as valid JSON/
  );

  // Test non-array input
  await assert.rejects(
    async () => {
      await tool.handler({ jsonData: "{}" });
    },
    /Input JSON must be an array of objects/
  );

  // Test neither provided
  await assert.rejects(
    async () => {
      await tool.handler({});
    },
    /Either filePath or jsonData must be provided/
  );
}
