import fs from 'fs';
import pdf from 'pdf-parse';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

export function rawTextToMarkdown(text: string): string {
  const lines = text.split('\n');
  const markdownLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) {
        inList = false;
      }
      markdownLines.push('');
      continue;
    }

    // Heuristics for headers
    const isUppercaseHeader = line.length < 60 && line === line.toUpperCase() && /[A-Z]/.test(line);
    const isNumberedHeader = /^\d+(\.\d+)*\.?\s+[A-Z]/.test(line) && line.length < 80;

    if (isUppercaseHeader || isNumberedHeader) {
      if (inList) inList = false;
      const prefix = isUppercaseHeader ? '##' : '###';
      markdownLines.push(`${prefix} ${line}`);
      continue;
    }

    // Heuristics for lists
    const bulletMatch = line.match(/^([•\-\*\+])\s*(.*)/);
    if (bulletMatch) {
      inList = true;
      markdownLines.push(`- ${bulletMatch[2]}`);
      continue;
    }

    const numberedListMatch = line.match(/^(\d+)\.\s*(.*)/);
    if (numberedListMatch && line.length < 150) {
      inList = true;
      markdownLines.push(`${numberedListMatch[1]}. ${numberedListMatch[2]}`);
      continue;
    }

    markdownLines.push(line);
  }

  return markdownLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const tool: ToolDefinition = {
  name: "pdf.convert_to_markdown",
  description: "Extract text from a PDF file and apply heuristics to format it into Markdown.",
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
    const markdown = rawTextToMarkdown(data.text);
    return {
      markdown,
      pages: data.numpages,
      metadata: data.info
    };
  }
};
