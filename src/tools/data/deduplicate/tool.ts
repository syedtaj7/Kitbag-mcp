import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "data.deduplicate",
  description: "Remove duplicate entries from a JSON array of objects or strings.",
  inputSchema: {
    type: "object",
    properties: {
      arrayData: {
        type: "string",
        description: "JSON string representing the array to deduplicate."
      },
      key: {
        type: "string",
        description: "Optional object property key to deduplicate by (e.g. 'id' or 'email'). If omitted, checks full object identity."
      }
    },
    required: ["arrayData"]
  },
  handler: async (args: { arrayData: string; key?: string }) => {
    let parsed: any;
    try {
      parsed = JSON.parse(args.arrayData);
    } catch (e: any) {
      throw new Error(`Failed to parse arrayData as JSON: ${e.message}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Input arrayData must be a JSON array.");
    }

    const key = args.key;
    const seen = new Set<any>();
    const result: any[] = [];

    for (const item of parsed) {
      if (key !== undefined && typeof item === 'object' && item !== null) {
        const val = item[key];
        if (val !== undefined) {
          if (!seen.has(val)) {
            seen.add(val);
            result.push(item);
          }
        } else {
          const str = JSON.stringify(item);
          if (!seen.has(str)) {
            seen.add(str);
            result.push(item);
          }
        }
      } else {
        const identifier = typeof item === 'object' && item !== null ? JSON.stringify(item) : item;
        if (!seen.has(identifier)) {
          seen.add(identifier);
          result.push(item);
        }
      }
    }

    return {
      originalCount: parsed.length,
      deduplicatedCount: result.length,
      removedCount: parsed.length - result.length,
      data: result
    };
  }
};
