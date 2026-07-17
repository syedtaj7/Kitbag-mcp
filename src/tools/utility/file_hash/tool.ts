import fs from 'fs';
import crypto from 'crypto';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "utility.file_hash",
  description: "Calculate the cryptographic hash (SHA-256, MD5, SHA-1) of a file or text string.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Text content to hash." },
      filePath: { type: "string", description: "Local path to a file to hash." },
      algorithm: {
        type: "string",
        description: "Hashing algorithm. Defaults to 'sha256'.",
        enum: ["sha256", "md5", "sha1"],
        default: "sha256"
      }
    },
    oneOf: [
      { required: ["text"] },
      { required: ["filePath"] }
    ]
  },
  handler: async (args: { text?: string; filePath?: string; algorithm?: string }) => {
    const algo = args.algorithm || 'sha256';
    let buffer: Buffer;

    if (args.filePath) {
      validateFileSize(args.filePath, 100 * 1024 * 1024);
      buffer = fs.readFileSync(args.filePath);
    } else if (args.text !== undefined) {
      buffer = Buffer.from(args.text, 'utf8');
    } else {
      throw new Error("Either text or filePath must be provided.");
    }

    const hash = crypto.createHash(algo).update(buffer).digest('hex');

    return {
      success: true,
      algorithm: algo,
      hash,
      sizeBytes: buffer.length
    };
  }
};
