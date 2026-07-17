import { tool } from './tool.js';
import assert from 'assert';
import Jimp from 'jimp';

export async function runTests() {
  const img = new Jimp(1, 1, 0xFF0000FF);
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  const base64 = buffer.toString('base64');

  const result = await tool.handler({
    fileData: base64,
    width: 10,
    height: 10
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.fileData);

  const outImg = await Jimp.read(Buffer.from(result.fileData, 'base64'));
  assert.strictEqual(outImg.getWidth(), 10, "Resized width should be 10");
  assert.strictEqual(outImg.getHeight(), 10, "Resized height should be 10");
}
