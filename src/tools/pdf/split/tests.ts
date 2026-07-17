import { tool } from './tool.js';
import assert from 'assert';
import { PDFDocument } from 'pdf-lib';

export async function runTests() {
  const pdf = await PDFDocument.create();
  pdf.addPage([100, 100]);
  pdf.addPage([100, 100]);
  pdf.addPage([100, 100]);
  const bytes = await pdf.save();
  const base64 = Buffer.from(bytes).toString('base64');

  const result = await tool.handler({
    fileData: base64,
    pages: "1, 3"
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.totalPages, 3);
  assert.strictEqual(result.extractedCount, 2);
  assert.strictEqual(result.files[0].page, 1);
  assert.strictEqual(result.files[1].page, 3);

  const split1 = await PDFDocument.load(Buffer.from(result.files[0].fileData, 'base64'));
  assert.strictEqual(split1.getPageCount(), 1);
}
