import { tool } from './tool.js';
import assert from 'assert';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runTests() {
  // Test basic decode to text
  const base64 = "TUNQIFNlcnZlciBUb29sYm94";
  const result = await tool.handler({ base64 });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.text, "MCP Server Toolbox");
  assert.strictEqual(result.sizeBytes, 18);

  // Test data URL parsing
  const dataUrl = "data:text/plain;base64,TUNQIFNlcnZlciBUb29sYm94";
  const resultUrl = await tool.handler({ base64: dataUrl });
  assert.strictEqual(resultUrl.text, "MCP Server Toolbox");

  // Test decoding to a file
  const tempFile = path.join(__dirname, 'temp_decode.txt');
  try {
    const fileResult = await tool.handler({ base64, outputPath: tempFile });
    assert.strictEqual(fileResult.success, true);
    assert.ok(fs.existsSync(tempFile));
    assert.strictEqual(fs.readFileSync(tempFile, 'utf8'), "MCP Server Toolbox");
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}
