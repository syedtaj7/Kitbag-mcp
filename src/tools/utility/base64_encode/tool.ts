import fs from 'fs';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "utility.base64_encode",
  description: "Encode a text string or a local file to Base64 format.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Text content to encode." },
      filePath: { type: "string", description: "Local path to a file to encode." }
    },
    oneOf: [
      { required: ["text"] },
      { required: ["filePath"] }
    ]
  },
  handler: async (args: { text?: string; filePath?: string }) => {
    if (args.filePath) {
      validateFileSize(args.filePath, 50 * 1024 * 1024);
      const buffer = fs.readFileSync(args.filePath);
      return {
        success: true,
        base64: buffer.toString('base64'),
        sizeBytes: buffer.length
      };
    } else if (args.text !== undefined) {
      const buffer = Buffer.from(args.text, 'utf8');
      return {
        success: true,
        base64: buffer.toString('base64'),
        sizeBytes: buffer.length
      };
    } else {
      throw new Error("Either text or filePath must be provided.");
    }
  }
};
