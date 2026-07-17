import { tool as qrGenerate } from '../qr_generate/tool.js';
import { tool as qrRead } from './tool.js';
import assert from 'assert';

export async function runTests() {
  // 1. Generate QR code
  const genResult = await qrGenerate.handler({ text: "Integration Test Code" });
  assert.ok(genResult.success);
  assert.ok(genResult.dataUrl);

  // Extract the raw base64 part
  const base64Data = genResult.dataUrl.split(',')[1];

  // 2. Read QR code
  const readResult = await qrRead.handler({ fileData: base64Data });
  assert.ok(readResult.success);
  assert.strictEqual(readResult.text, "Integration Test Code");
}
