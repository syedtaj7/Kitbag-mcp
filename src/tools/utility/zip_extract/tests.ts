import { tool as zipCreateTool } from '../zip_create/tool.js';
import { tool as zipExtractTool } from './tool.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runTests() {
  const zipPath = path.join(__dirname, 'temp.zip');
  const extractDir = path.join(__dirname, 'extracted_temp');

  try {
    await zipCreateTool.handler({
      files: [
        { name: "readme.txt", content: "Extracted Content Check!" }
      ],
      outputPath: zipPath
    });

    const result = await zipExtractTool.handler({
      zipPath,
      outputPath: extractDir
    });

    assert.strictEqual(result.success, true);
    
    const readmePath = path.join(extractDir, 'readme.txt');
    assert.ok(fs.existsSync(readmePath));
    assert.strictEqual(fs.readFileSync(readmePath, 'utf8'), "Extracted Content Check!");
  } finally {
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
  }
}
