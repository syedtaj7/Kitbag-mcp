import { v4 as uuidv4, v1 as uuidv1 } from 'uuid';
import crypto from 'crypto';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "utility.uuid_generate",
  description: "Generate a cryptographically secure UUID (v4/v1) or a secure random password.",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        description: "Type of identifier to generate.",
        enum: ["v4", "v1", "password"],
        default: "v4"
      },
      length: {
        type: "number",
        description: "Length of the password if type is 'password'. Defaults to 16.",
        default: 16
      }
    }
  },
  handler: async (args: { type?: string; length?: number }) => {
    const type = args.type || 'v4';
    const length = args.length || 16;

    if (type === 'v4') {
      return {
        success: true,
        type: "uuid-v4",
        value: uuidv4()
      };
    } else if (type === 'v1') {
      return {
        success: true,
        type: "uuid-v1",
        value: uuidv1()
      };
    } else if (type === 'password') {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
      const bytes = crypto.randomBytes(length);
      let value = "";
      for (let i = 0; i < length; i++) {
        value += chars[bytes[i] % chars.length];
      }
      return {
        success: true,
        type: "secure-password",
        value
      };
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }
  }
};
