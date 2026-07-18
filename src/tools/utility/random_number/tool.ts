import crypto from 'crypto';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "utility.random_number",
  description: "Generate a cryptographically secure random integer within a specified range [min, max].",
  inputSchema: {
    type: "object",
    properties: {
      min: {
        type: "number",
        description: "The minimum integer value (inclusive). Defaults to 1.",
        default: 1
      },
      max: {
        type: "number",
        description: "The maximum integer value (inclusive). Defaults to 100.",
        default: 100
      }
    }
  },
  handler: async (args: { min?: number; max?: number }) => {
    const min = Math.floor(args.min !== undefined ? args.min : 1);
    const max = Math.floor(args.max !== undefined ? args.max : 100);

    if (min > max) {
      throw new Error(`Minimum value (${min}) cannot be greater than maximum value (${max}).`);
    }

    // crypto.randomInt is exclusive of max, so we add 1 to include max in range
    const value = crypto.randomInt(min, max + 1);

    return {
      success: true,
      min,
      max,
      value
    };
  }
};
