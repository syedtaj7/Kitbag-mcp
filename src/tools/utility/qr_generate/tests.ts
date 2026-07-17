import { tool } from './tool.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

export async function runTests() {
  const result = await tool.handler({ text: "Hello MCP" });
  assert.ok(result.success);
  assert.ok(result.dataUrl.startsWith("data:image/png;base64,"));

  const tempPath = path.join(process.cwd(), 'temp_test_qr.png');
  try {
    const resultFile = await tool.handler({ text: "Hello MCP File", outputPath: tempPath });
    assert.ok(resultFile.success);
    assert.ok(fs.existsSync(tempPath));
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}
