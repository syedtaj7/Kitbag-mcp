import fs from 'fs';
import { stringify } from 'csv-stringify/sync';
import { ToolDefinition } from '../../../registry/registry.js';
import { validateFileSize } from '../../../middleware/limiter.js';

export const tool: ToolDefinition = {
  name: "data.json_to_csv",
  description: "Convert a JSON array of objects to a CSV string.",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Local filesystem path to a JSON file containing the array."
      },
      jsonData: {
        type: "string",
        description: "Raw JSON string (must represent an array of objects) to convert."
      },
      delimiter: {
        type: "string",
        description: "The field delimiter character to use. Defaults to ','.",
        default: ","
      }
    },
    oneOf: [
      { required: ["filePath"] },
      { required: ["jsonData"] }
    ]
  },
  handler: async (args: { filePath?: string; jsonData?: string; delimiter?: string }) => {
    let rawJson: string;
    const delimiter = args.delimiter || ',';

    if (args.filePath) {
      validateFileSize(args.filePath, 50 * 1024 * 1024); // 50MB limit
      rawJson = fs.readFileSync(args.filePath, 'utf8');
    } else if (args.jsonData !== undefined) {
      rawJson = args.jsonData;
    } else {
      throw new Error("Either filePath or jsonData must be provided.");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch (e: any) {
      throw new Error(`Failed to parse input as valid JSON: ${e.message}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Input JSON must be an array of objects.");
    }

    const csvOutput = stringify(parsed, {
      header: true,
      delimiter
    });

    return {
      csv: csvOutput
    };
  }
};
