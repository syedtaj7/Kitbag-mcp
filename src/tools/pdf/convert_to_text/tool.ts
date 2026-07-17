import fs from 'fs';
import pdf from 'pdf-parse';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "pdf.convert_to_text",
  description: "Extract raw text from a PDF file using pdf-parse (supports local file path or base64 data).",
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

    const parser = (globalThis as any).__mockPdfParse || pdf;
    const data = await parser(buffer);
    return {
      text: data.text,
      pages: data.numpages,
      metadata: data.info
    };
  }
};
