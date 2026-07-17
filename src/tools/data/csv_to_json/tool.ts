import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "data.csv_to_json",
  description: "Convert a CSV file or CSV string data to a JSON array.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Local filesystem path to the CSV file."
      },
      csvData: {
        type: "string",
        description: "Raw CSV string data to parse."
      },
      delimiter: {
        type: "string",
        description: "The field delimiter character. Defaults to ','.",
        default: ","
      },
      columns: {
        type: "boolean",
        description: "If true, treats the first line as column names and outputs an array of objects. Otherwise outputs an array of arrays. Defaults to true.",
        default: true
      }
    },
    oneOf: [
      { required: ["filePath"] },
      { required: ["csvData"] }
    ]
  },
  handler: async (args: { filePath?: string; csvData?: string; delimiter?: string; columns?: boolean }) => {
    let rawCsv: string;
    const delimiter = args.delimiter || ',';
    const columns = args.columns !== false;

    if (args.filePath) {
      validateFileSize(args.filePath, 50 * 1024 * 1024); // 50MB limit
      rawCsv = fs.readFileSync(args.filePath, 'utf8');
    } else if (args.csvData !== undefined) {
      rawCsv = args.csvData;
    } else {
      throw new Error("Either filePath or csvData must be provided.");
    }

    const records = parse(rawCsv, {
      delimiter,
      columns,
      skip_empty_lines: true,
      trim: true
    });

    return {
      data: records,
      count: records.length
    };
  }
};
