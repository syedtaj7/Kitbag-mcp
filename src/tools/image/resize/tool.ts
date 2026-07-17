import fs from 'fs';
import Jimp from 'jimp';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "image.resize",
  description: "Resize an image to specific width and height dimensions.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Local path to the image file." },
      fileData: { type: "string", description: "Base64 encoded image data." },
      width: { type: "number", description: "Target width in pixels." },
      height: { type: "number", description: "Target height in pixels. If omitted, scales proportionally." },
      outputPath: { type: "string", description: "Optional local path where the resized image should be saved." }
    },
    required: ["width"],
    oneOf: [
      { required: ["filePath"] },
      { required: ["fileData"] }
    ]
  },
  handler: async (args: { filePath?: string; fileData?: string; width: number; height?: number; outputPath?: string }) => {
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
    const w = args.width;
    const h = args.height ?? Jimp.AUTO;
    
    image.resize(w, h);
    const mime = image.getMIME();
    const outputBuffer = await image.getBufferAsync(mime);

    if (args.outputPath) {
      fs.writeFileSync(args.outputPath, outputBuffer);
      return {
        success: true,
        message: `Image resized and saved to ${args.outputPath}`
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
