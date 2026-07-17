import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const sampleTableText = "Name    Age    Role\nAlice    30    Dev\nBob      25    PM";

  (globalThis as any).__mockPdfParse = async (buffer: Buffer) => {
    return {
      text: sampleTableText,
      numpages: 1,
      info: {}
    };
  };

  try {
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await tool.handler({ fileData: dummyBase64 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.tableCount, 1);
    assert.ok(result.tables[0].includes("Name | Age | Role"), "Should format columns with pipe separator");
    assert.ok(result.tables[0].includes("--- | --- | ---"), "Should generate table divider row");
  } finally {
    delete (globalThis as any).__mockPdfParse;
  }
}
