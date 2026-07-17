import YAML from 'yaml';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "data.yaml_to_json",
  description: "Convert a YAML string to a structured JSON object.",
  inputSchema: {
    type: "object",
    properties: {
      yaml: {
        type: "string",
        description: "The YAML text to convert."
      }
    },
    required: ["yaml"]
  },
  handler: async (args: { yaml: string }) => {
    try {
      const parsed = YAML.parse(args.yaml);
      return {
        success: true,
        data: parsed
      };
    } catch (e: any) {
      throw new Error(`Failed to parse YAML: ${e.message}`);
    }
  }
};
