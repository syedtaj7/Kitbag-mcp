import YAML from 'yaml';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "developer.openapi_parser",
  description: "Parse and validate an OpenAPI (Swagger) 3.0 / 3.1 specification, returning endpoints summary.",
  inputSchema: {
    type: "object",
    properties: {
      spec: {
        type: "string",
        description: "The OpenAPI specification string in JSON or YAML format."
      }
    },
    required: ["spec"]
  },
  handler: async (args: { spec: string }) => {
    let parsed: any;
    try {
      if (args.spec.trim().startsWith('{')) {
        parsed = JSON.parse(args.spec);
      } else {
        parsed = YAML.parse(args.spec);
      }
    } catch (e: any) {
      throw new Error(`Failed to parse specification: ${e.message}`);
    }

    const isOpenApi = parsed.openapi || parsed.swagger;
    if (!isOpenApi) {
      throw new Error("Invalid specification: Missing 'openapi' or 'swagger' version tag.");
    }

    if (!parsed.info || typeof parsed.info !== 'object') {
      throw new Error("Invalid specification: Missing 'info' object.");
    }

    if (!parsed.paths || typeof parsed.paths !== 'object') {
      throw new Error("Invalid specification: Missing 'paths' object.");
    }

    const endpoints: Array<{ path: string; method: string; summary: string; operationId: string }> = [];

    for (const [path, pathObj] of Object.entries(parsed.paths)) {
      if (pathObj && typeof pathObj === 'object') {
        for (const [method, methodObj] of Object.entries(pathObj)) {
          const m = method.toLowerCase();
          if (["get", "post", "put", "delete", "options", "head", "patch", "trace"].includes(m)) {
            const detail = methodObj as any;
            endpoints.push({
              path,
              method: m.toUpperCase(),
              summary: detail.summary || detail.description || "",
              operationId: detail.operationId || ""
            });
          }
        }
      }
    }

    return {
      title: parsed.info.title || "API",
      version: parsed.info.version || "1.0.0",
      openApiVersion: isOpenApi,
      endpointCount: endpoints.length,
      endpoints
    };
  }
};
