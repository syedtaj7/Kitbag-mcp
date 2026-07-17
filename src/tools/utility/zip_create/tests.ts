import { tool } from './tool.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runTests() {
  const outputPath = path.join(__dirname, 'test_output.zip');
  
  try {
    const result: any = await tool.handler({
      files: [
        { name: "test1.txt", content: "hello world" },
        { name: "sub/test2.txt", content: "nested hello" }
      ],
      outputPath
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.outputPath, outputPath);
    assert.ok(fs.existsSync(outputPath));
    assert.ok(result.sizeBytes > 0);
  } finally {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }
}
