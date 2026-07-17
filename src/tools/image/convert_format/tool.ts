import fs from 'fs';
import Jimp from 'jimp';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "image.convert_format",
  description: "Convert an image to a different file format (supports png, jpeg, bmp).",
  inputSchema: {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Local path to the image file." },
      fileData: { type: "string", description: "Base64 encoded image data." },
      format: { type: "string", description: "Target image format.", enum: ["png", "jpeg", "bmp"] },
      outputPath: { type: "string", description: "Optional local path where the converted image should be saved." }
    },
    required: ["format"],
    oneOf: [
      { required: ["filePath"] },
      { required: ["fileData"] }
    ]
  },
  handler: async (args: { filePath?: string; fileData?: string; format: string; outputPath?: string }) => {
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

    const image = await Jimp.read(buffer);
    const format = args.format.toLowerCase();
    
    let mime: string = Jimp.MIME_PNG;
    if (format === 'jpeg' || format === 'jpg') {
      mime = Jimp.MIME_JPEG;
    } else if (format === 'bmp') {
      mime = Jimp.MIME_BMP;
    }

    const outputBuffer = await image.getBufferAsync(mime);

    if (args.outputPath) {
      fs.writeFileSync(args.outputPath, outputBuffer);
      return {
        success: true,
        message: `Image converted to ${format} and saved to ${args.outputPath}`
      };
    } else {
      return {
        success: true,
        fileData: outputBuffer.toString('base64'),
        mimeType: mime
      };
    }
  }
};
