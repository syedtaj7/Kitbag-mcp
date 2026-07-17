import fs from 'fs';
import pdf from 'pdf-parse';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize, validateBase64Size } from '../../../middleware/limiter.js';

function extractTablesFromText(text: string): string[] {
  const lines = text.split('\n');
  const tables: string[][] = [];
  let currentTable: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentTable.length >= 2) {
        tables.push([...currentTable]);
      }
      currentTable = [];
      continue;
    }
    const cells = trimmed.split(/\s{2,}|\t|\|/).map(c => c.trim()).filter(Boolean);
    if (cells.length >= 3) {
      currentTable.push(cells.join(' | '));
    } else {
      if (currentTable.length >= 2) {
        tables.push([...currentTable]);
      }
      currentTable = [];
    }
  }
  if (currentTable.length >= 2) {
    tables.push(currentTable);
  }
  
  return tables.map(rows => {
    const colCount = rows[0].split(' | ').length;
    const separator = Array(colCount).fill('---').join(' | ');
    return [rows[0], separator, ...rows.slice(1)].join('\n');
  });
}

export const tool: ToolDefinition = {
  name: "pdf.extract_tables",
  description: "Extract structures resembling data tables from a PDF text stream and format them in Markdown.",
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
    const tables = extractTablesFromText(data.text);
    return {
      success: true,
      tableCount: tables.length,
      tables
    };
  }
};
