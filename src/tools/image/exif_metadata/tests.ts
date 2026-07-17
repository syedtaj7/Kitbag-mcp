import { tool } from './tool.js';
import assert from 'assert';
import Jimp from 'jimp';

export async function runTests() {
  const img = new Jimp(1, 1, 0xFFFFFFFF);
  const buffer = await img.getBufferAsync(Jimp.MIME_JPEG);
  const base64 = buffer.toString('base64');

  const result = await tool.handler({ fileData: base64 });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.hasMetadata, false);
}
