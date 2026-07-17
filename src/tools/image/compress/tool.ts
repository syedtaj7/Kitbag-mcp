import fs from 'fs';
import Jimp from 'jimp';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "image.compress",
  description: "Compress image quality to reduce file size.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Local path to the image file." },
      fileData: { type: "string", description: "Base64 encoded image data." },
      quality: { type: "number", description: "Compression quality from 1 to 100.", minimum: 1, maximum: 100 },
      outputPath: { type: "string", description: "Optional local path to save the compressed image." }
    },
    required: ["quality"],
    oneOf: [
      { required: ["filePath"] },
      { required: ["fileData"] }
    ]
  },
  handler: async (args: { filePath?: string; fileData?: string; quality: number; outputPath?: string }) => {
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
    image.quality(args.quality);
    const mime = image.getMIME();
    const outputBuffer = await image.getBufferAsync(mime);

    if (args.outputPath) {
      fs.writeFileSync(args.outputPath, outputBuffer);
      return {
        success: true,
        message: `Image compressed and saved to ${args.outputPath}`
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
