import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "developer.json_formatter",
  description: "Validate, format (pretty-print), or minify JSON strings.",
  inputSchema: {
    type: "object",
    properties: {
      json: {
        type: "string",
        description: "The JSON string to format."
      },
      minify: {
        type: "boolean",
        description: "If true, outputs minified JSON. If false, pretty-prints it. Defaults to false.",
        default: false
      },
      indent: {
        type: "number",
        description: "Indentation spaces for pretty-print. Defaults to 2.",
        default: 2
      }
    },
    required: ["json"]
  },
  handler: async (args: { json: string; minify?: boolean; indent?: number }) => {
    let parsed: any;
    try {
      parsed = JSON.parse(args.json);
    } catch (e: any) {
      throw new Error(`Invalid JSON: ${e.message}`);
    }

    const minify = args.minify === true;
    const indent = args.indent ?? 2;

    const formatted = minify
      ? JSON.stringify(parsed)
      : JSON.stringify(parsed, null, indent);

    return {
      success: true,
      formatted,
      sizeBytes: Buffer.byteLength(formatted, 'utf8')
    };
  }
};
