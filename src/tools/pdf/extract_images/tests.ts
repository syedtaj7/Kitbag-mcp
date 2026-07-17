import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const mockJpegPdf = Buffer.concat([
    Buffer.from("dummy pdf header"),
    Buffer.from([0xff, 0xd8, 0xff]),
    Buffer.from("fakeimagebytesherewithlengthgreaterthan500" + "x".repeat(500)),
    Buffer.from([0xff, 0xd9]),
    Buffer.from("dummy pdf footer")
  ]);

  const base64 = mockJpegPdf.toString('base64');
  const result = await tool.handler({ fileData: base64 });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.imageCount, 1);
  assert.strictEqual(result.images[0].format, "jpeg");
}
