import QRCode from 'qrcode';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "utility.qr_generate",
  description: "Generate a QR code for a given text or URL, returning a base64 Data URL or saving to a file.",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The content (text or URL) to encode in the QR code."
      },
      outputPath: {
        type: "string",
        description: "Optional local path where the QR code image (.png) should be saved."
      }
    },
    required: ["text"]
  },
  handler: async (args: { text: string; outputPath?: string }) => {
    if (args.outputPath) {
      await QRCode.toFile(args.outputPath, args.text);
      return {
        success: true,
        message: `QR code saved to ${args.outputPath}`
      };
    } else {
      const dataUrl = await QRCode.toDataURL(args.text);
      return {
        success: true,
        dataUrl
      };
    }
  }
};
