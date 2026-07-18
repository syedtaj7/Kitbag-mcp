import { tool } from './tool.js';
import assert from 'assert';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runTests() {
  // Test text encoding
  const text = "MCP Server Toolbox";
  const result = await tool.handler({ text });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.base64, "TUNQIFNlcnZlciBUb29sYm94");
  assert.strictEqual(result.sizeBytes, text.length);

  // Test file encoding
  const tempFile = path.join(__dirname, 'temp_encode.txt');
  fs.writeFileSync(tempFile, "hello file encoding", 'utf8');

  try {
    const fileResult = await tool.handler({ filePath: tempFile });
    assert.strictEqual(fileResult.success, true);
    assert.strictEqual(fileResult.base64, Buffer.from("hello file encoding").toString('base64'));
    assert.strictEqual(fileResult.sizeBytes, 19);
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }

  // Test error when neither is provided
  await assert.rejects(
    async () => {
      await tool.handler({});
    },
    /Either text or filePath must be provided/
  );
}
