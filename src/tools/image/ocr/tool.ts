import fs from 'fs';
import Tesseract from 'tesseract.js';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "image.ocr",
  description: "Extract text from an image (PNG, JPEG, etc.) using Tesseract OCR. Supports local file path or base64 data.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Local filesystem path to the image file."
      },
      fileData: {
        type: "string",
        description: "Base64 encoded image data."
      },
      language: {
        type: "string",
        description: "Language code for OCR (e.g., 'eng' for English, 'spa' for Spanish, 'fra' for French). Defaults to 'eng'.",
        default: "eng"
      }
    },
    oneOf: [
      { required: ["filePath"] },
      { required: ["fileData"] }
    ]
  },
  handler: async (args: { filePath?: string; fileData?: string; language?: string }) => {
    let input: Buffer | string;
    const lang = args.language || 'eng';

    if (args.filePath) {
      validateFileSize(args.filePath, 20 * 1024 * 1024); // 20MB limit for images
      input = args.filePath;
    } else if (args.fileData) {
      validateBase64Size(args.fileData, 20 * 1024 * 1024);
      input = Buffer.from(args.fileData, 'base64');
    } else {
      throw new Error("Either filePath or fileData must be provided.");
    }

    const result = await Tesseract.recognize(input, lang);
    return {
      text: result.data.text,
      confidence: result.data.confidence,
      language: lang
    };
  }
};
