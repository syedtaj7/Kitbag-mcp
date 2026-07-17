import { ToolDefinition } from '../../../registry/registry.js';

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export const tool: ToolDefinition = {
  name: "developer.jwt_decoder",
  description: "Decode the header and payload of a JSON Web Token (JWT) without verification, displaying timestamps in human-readable formats.",
  inputSchema: {
    type: "object",
    properties: {
      token: {
        type: "string",
        description: "The raw JWT token string."
      }
    },
    required: ["token"]
  },
  handler: async (args: { token: string }) => {
    const parts = args.token.trim().split('.');
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token structure. A JWT must consist of three parts separated by dots.");
    }

    let header: any;
    let payload: any;

    try {
      header = JSON.parse(base64UrlDecode(parts[0]));
    } catch (e: any) {
      throw new Error(`Failed to parse JWT header: ${e.message}`);
    }

    try {
      payload = JSON.parse(base64UrlDecode(parts[1]));
    } catch (e: any) {
      throw new Error(`Failed to parse JWT payload: ${e.message}`);
    }

    const times: any = {};
    if (payload.exp && typeof payload.exp === 'number') {
      times.expirationTime = new Date(payload.exp * 1000).toISOString();
      times.isExpired = Date.now() > payload.exp * 1000;
    }
    if (payload.iat && typeof payload.iat === 'number') {
      times.issuedAt = new Date(payload.iat * 1000).toISOString();
    }
    if (payload.nbf && typeof payload.nbf === 'number') {
      times.notBefore = new Date(payload.nbf * 1000).toISOString();
    }

    return {
      success: true,
      header,
      payload,
      signatureLength: parts[2].length,
      ...times
    };
  }
};
