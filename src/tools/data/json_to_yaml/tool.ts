import YAML from 'yaml';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "data.json_to_yaml",
  description: "Convert a JSON object or string to a YAML text string.",
  inputSchema: {
    type: "object",
    properties: {
      jsonData: {
        type: "string",
        description: "The JSON string representation of the object to convert."
      }
    },
    required: ["jsonData"]
  },
  handler: async (args: { jsonData: string }) => {
    let parsed: any;
    try {
      parsed = JSON.parse(args.jsonData);
    } catch (e: any) {
      throw new Error(`Failed to parse input as JSON: ${e.message}`);
    }

    try {
      const yamlStr = YAML.stringify(parsed);
      return {
        success: true,
        yaml: yamlStr
      };
    } catch (e: any) {
      throw new Error(`Failed to stringify object to YAML: ${e.message}`);
    }
  }
};
