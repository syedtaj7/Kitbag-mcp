import fs from 'fs';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateBase64Size } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "utility.base64_decode",
  description: "Decode a Base64 encoded string back to its original plain text or save to a file.",
  inputSchema: {
    type: "object",
    properties: {
      base64: { type: "string", description: "The Base64 encoded string payload." },
      outputPath: { type: "string", description: "Optional local path to save the decoded binary data." }
    },
    required: ["base64"]
  },
  handler: async (args: { base64: string; outputPath?: string }) => {
    validateBase64Size(args.base64, 50 * 1024 * 1024);
    
    let cleanBase64 = args.base64;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }

    const buffer = Buffer.from(cleanBase64, 'base64');

    if (args.outputPath) {
      fs.writeFileSync(args.outputPath, buffer);
      return {
        success: true,
        message: `Decoded file saved to ${args.outputPath}`,
        sizeBytes: buffer.length
      };
    } else {
      const text = buffer.toString('utf8');
      return {
        success: true,
        text,
        sizeBytes: buffer.length
      };
    }
  }
};
