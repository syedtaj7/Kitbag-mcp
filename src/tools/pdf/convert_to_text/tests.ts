import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  (globalThis as any).__mockPdfParse = async (buffer: Buffer) => {
    return {
      text: "Hello World",
      numpages: 1,
      info: { Title: "Mock Document" }
    };
  };

  try {
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await tool.handler({ fileData: dummyBase64 });
    assert.strictEqual(result.text, "Hello World", "Extracted text should match mock output");
    assert.strictEqual(result.pages, 1, "Should return 1 page");
    assert.strictEqual(result.metadata?.Title, "Mock Document");
  } finally {
    delete (globalThis as any).__mockPdfParse;
  }
}
