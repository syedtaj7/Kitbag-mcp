import { tool } from './tool.js';
import assert from 'assert';
import { PDFDocument } from 'pdf-lib';

export async function runTests() {
  const pdf1 = await PDFDocument.create();
  pdf1.addPage([100, 100]);
  const bytes1 = await pdf1.save();
  const base64_1 = Buffer.from(bytes1).toString('base64');

  const pdf2 = await PDFDocument.create();
  pdf2.addPage([100, 100]);
  const bytes2 = await pdf2.save();
  const base64_2 = Buffer.from(bytes2).toString('base64');

  const result = await tool.handler({
    files: [
      { fileData: base64_1 },
      { fileData: base64_2 }
    ]
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.fileData);

  const mergedDoc = await PDFDocument.load(Buffer.from(result.fileData, 'base64'));
  assert.strictEqual(mergedDoc.getPageCount(), 2, "Merged PDF should contain exactly 2 pages");
}
