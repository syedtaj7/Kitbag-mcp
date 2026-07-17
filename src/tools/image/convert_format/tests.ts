import { tool } from './tool.js';
import assert from 'assert';
import Jimp from 'jimp';

export async function runTests() {
  const img = new Jimp(1, 1, 0x0000FFFF);
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  const base64 = buffer.toString('base64');

  const result = await tool.handler({
    fileData: base64,
    format: "jpeg"
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.fileData);
  assert.strictEqual(result.mimeType, Jimp.MIME_JPEG);
}
