import fs from 'fs';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

function carveImages(buffer: Buffer): string[] {
  const images: string[] = [];
  let pos = 0;
  
  while (pos < buffer.length) {
    const start = buffer.indexOf(Buffer.from([0xff, 0xd8, 0xff]), pos);
    if (start === -1) break;
    const end = buffer.indexOf(Buffer.from([0xff, 0xd9]), start);
    if (end === -1) {
      pos = start + 3;
      continue;
    }
    const imgBuffer = buffer.slice(start, end + 2);
    if (imgBuffer.length > 500) { // filter out noise
      images.push(imgBuffer.toString('base64'));
    }
    pos = end + 2;
    if (images.length >= 20) break; // limit to 20 images
  }
  return images;
}

export const tool: ToolDefinition = {
  name: "pdf.extract_images",
  description: "Extract embedded JPEG images from a PDF file.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Local filesystem path to the PDF file."
      },
      fileData: {
        type: "string",
        description: "Base64 encoded PDF file data."
      }
    },
    oneOf: [
      { required: ["filePath"] },
      { required: ["fileData"] }
    ]
  },
  handler: async (args: { filePath?: string; fileData?: string }) => {
    let buffer: Buffer;

    if (args.filePath) {
      validateFileSize(args.filePath, 50 * 1024 * 1024);
      buffer = fs.readFileSync(args.filePath);
    } else if (args.fileData) {
      validateBase64Size(args.fileData, 50 * 1024 * 1024);
      buffer = Buffer.from(args.fileData, 'base64');
    } else {
      throw new Error("Either filePath or fileData must be provided.");
    }

    const images = carveImages(buffer);
    return {
      success: true,
      imageCount: images.length,
      images: images.map((base64, index) => ({
        index,
        format: "jpeg",
        base64
      }))
    };
  }
};
