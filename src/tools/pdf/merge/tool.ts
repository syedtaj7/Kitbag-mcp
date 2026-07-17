import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "pdf.merge",
  description: "Merge multiple PDF files into a single PDF document.",
  inputSchema: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            filePath: { type: "string" },
            fileData: { type: "string", description: "Base64 encoded PDF data" }
          }
        },
        description: "List of PDF files to merge in order."
      },
      outputPath: {
        type: "string",
        description: "Optional local path where the merged PDF should be saved."
      }
    },
    required: ["files"]
  },
  handler: async (args: { files: Array<{ filePath?: string; fileData?: string }>; outputPath?: string }) => {
    if (!args.files || args.files.length === 0) {
      throw new Error("Files list must not be empty.");
    }

    const mergedDoc = await PDFDocument.create();

    for (const file of args.files) {
      let buffer: Buffer;
      if (file.filePath) {
        validateFileSize(file.filePath, 50 * 1024 * 1024);
        buffer = fs.readFileSync(file.filePath);
      } else if (file.fileData) {
        validateBase64Size(file.fileData, 50 * 1024 * 1024);
        buffer = Buffer.from(file.fileData, 'base64');
      } else {
        throw new Error("Each item in files must have filePath or fileData.");
      }

      const tempDoc = await PDFDocument.load(buffer);
      const copiedPages = await mergedDoc.copyPages(tempDoc, tempDoc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    const mergedBytes = await mergedDoc.save();

    if (args.outputPath) {
      fs.writeFileSync(args.outputPath, mergedBytes);
      return {
        success: true,
        message: `Merged PDF saved to ${args.outputPath}`
      };
    } else {
      return {
        success: true,
        fileData: Buffer.from(mergedBytes).toString('base64')
      };
    }
  }
};
