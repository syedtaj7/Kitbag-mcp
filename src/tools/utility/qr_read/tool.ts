import fs from 'fs';
import Jimp from 'jimp';
import jsQRModule from 'jsqr';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

// Support both standard ESM and CJS defaults
const jsQR = (jsQRModule as any).default || jsQRModule;

export const tool: ToolDefinition = {
  name: "utility.qr_read",
  description: "Decode a QR code from an image file or base64 image data.",
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
      }
    },
    oneOf: [
      { required: ["filePath"] },
      { required: ["fileData"] }
    ]
  },
  handler: async (args: { filePath?: string; fileData?: string }) => {
    let image: Jimp;

    if (args.filePath) {
      validateFileSize(args.filePath, 20 * 1024 * 1024); // 20MB limit
      image = await Jimp.read(args.filePath);
    } else if (args.fileData) {
      validateBase64Size(args.fileData, 20 * 1024 * 1024);
      const buffer = Buffer.from(args.fileData, 'base64');
      image = await Jimp.read(buffer);
    } else {
      throw new Error("Either filePath or fileData must be provided.");
    }

    const qrCode = jsQR(
      new Uint8ClampedArray(image.bitmap.data),
      image.bitmap.width,
      image.bitmap.height
    );

    if (qrCode) {
      return {
        success: true,
        text: qrCode.data
      };
    } else {
      throw new Error("No QR code found or could not be decoded in the image.");
    }
  }
};
