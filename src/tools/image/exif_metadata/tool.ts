import fs from 'fs';
import ExifParser from 'exif-parser';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "image.exif_metadata",
  description: "Extract EXIF metadata tags (e.g. camera, GPS, capture date) from JPEG images.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Local path to the image file." },
      fileData: { type: "string", description: "Base64 encoded image data." }
    },
    oneOf: [
      { required: ["filePath"] },
      { required: ["fileData"] }
    ]
  },
  handler: async (args: { filePath?: string; fileData?: string }) => {
    let buffer: Buffer;

    if (args.filePath) {
      validateFileSize(args.filePath, 20 * 1024 * 1024);
      buffer = fs.readFileSync(args.filePath);
    } else if (args.fileData) {
      validateBase64Size(args.fileData, 20 * 1024 * 1024);
      buffer = Buffer.from(args.fileData, 'base64');
    } else {
      throw new Error("Either filePath or fileData must be provided.");
    }

    try {
      const parser = ExifParser.create(buffer);
      const result = parser.parse();
      return {
        success: true,
        tags: result.tags || {},
        imageSize: result.imageSize || {},
        hasMetadata: Object.keys(result.tags || {}).length > 0
      };
    } catch (e: any) {
      return {
        success: true,
        tags: {},
        hasMetadata: false,
        message: `Exif parsing skipped: ${e.message}`
      };
    }
  }
};
