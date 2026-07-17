import { tool } from './tool.js';
import assert from 'assert';
import Tesseract from 'tesseract.js';

export async function runTests() {
  const originalRecognize = Tesseract.recognize;
  try {
    Tesseract.recognize = async (image, langs, options) => {
      return {
        data: {
          text: "Mocked OCR Text from Image",
          confidence: 95
        }
      } as any;
    };

    // A single pixel 1x1 black PNG
    const dummyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await tool.handler({ fileData: dummyPngBase64 });
    assert.strictEqual(result.text, "Mocked OCR Text from Image");
    assert.strictEqual(result.confidence, 95);
  } finally {
    Tesseract.recognize = originalRecognize;
  }
}
