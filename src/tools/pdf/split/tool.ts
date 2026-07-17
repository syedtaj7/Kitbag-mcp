import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const range = part.trim().split('-');
    if (range.length === 1) {
      const p = parseInt(range[0], 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        pages.push(p - 1);
      }
    } else if (range.length === 2) {
      const start = parseInt(range[0], 10);
      const end = parseInt(range[1], 10);
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
        for (let i = start; i <= end; i++) {
          pages.push(i - 1);
        }
      }
    }
  }
  return Array.from(new Set(pages)).sort((a, b) => a - b);
}

export const tool: ToolDefinition = {
  name: "pdf.split",
  description: "Split a PDF file into separate pages or custom page ranges.",
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
      },
      pages: {
        type: "string",
        description: "Page range to extract (e.g. '1', '2-5', '1, 3, 5-8'). Defaults to extracting all pages as individual files."
      }
    },
    oneOf: [
      { required: ["filePath"] },
      { required: ["fileData"] }
    ]
  },
  handler: async (args: { filePath?: string; fileData?: string; pages?: string }) => {
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

    const srcDoc = await PDFDocument.load(buffer);
    const totalPages = srcDoc.getPageCount();

    let targetPages: number[] = [];
    if (args.pages) {
      targetPages = parsePageRanges(args.pages, totalPages);
    } else {
      targetPages = Array.from({ length: totalPages }, (_, i) => i);
    }

    const results: Array<{ page: number; fileData: string }> = [];

    for (const pageIndex of targetPages) {
      const splitDoc = await PDFDocument.create();
      const [copiedPage] = await splitDoc.copyPages(srcDoc, [pageIndex]);
      splitDoc.addPage(copiedPage);
      const splitBytes = await splitDoc.save();
      results.push({
        page: pageIndex + 1,
        fileData: Buffer.from(splitBytes).toString('base64')
      });
    }

    return {
      success: true,
      totalPages,
      extractedCount: results.length,
      files: results
    };
  }
};
