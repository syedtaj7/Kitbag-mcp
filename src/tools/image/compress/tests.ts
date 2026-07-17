import { tool } from './tool.js';
import assert from 'assert';
import Jimp from 'jimp';

export async function runTests() {
  const img = new Jimp(2, 2, 0x00FF00FF);
  const buffer = await img.getBufferAsync(Jimp.MIME_JPEG);
  const base64 = buffer.toString('base64');

  const result = await tool.handler({
    fileData: base64,
    quality: 50
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.fileData);
  assert.strictEqual(result.mimeType, Jimp.MIME_JPEG);
}
