import { tool, rawTextToMarkdown } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const sampleText = "1. Introduction\nSome text.\n\n• First bullet\n• Second bullet\n\nTITLE GOES HERE";

  (globalThis as any).__mockPdfParse = async (buffer: Buffer) => {
    return {
      text: sampleText,
      numpages: 1,
      info: { Title: "Mock Document" }
    };
  };

  try {
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await tool.handler({ fileData: dummyBase64 });
    assert.ok(result.markdown.includes("### 1. Introduction"));
    assert.ok(result.markdown.includes("- First bullet"));
    assert.ok(result.markdown.includes("## TITLE GOES HERE"));
    assert.strictEqual(result.pages, 1);
  } finally {
    delete (globalThis as any).__mockPdfParse;
  }
}
