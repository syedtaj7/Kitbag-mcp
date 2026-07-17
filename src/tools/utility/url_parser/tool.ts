import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "utility.url_parser",
  description: "Parse a URL string into its component parts (protocol, hostname, port, pathname, search params, hash).",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL string to parse."
      }
    },
    required: ["url"]
  },
  handler: async (args: { url: string }) => {
    let parsed: URL;
    try {
      parsed = new URL(args.url.trim());
    } catch (e: any) {
      throw new Error(`Invalid URL string: ${e.message}`);
    }

    const queryParams: Record<string, string | string[]> = {};
    parsed.searchParams.forEach((value, key) => {
      if (queryParams[key]) {
        if (Array.isArray(queryParams[key])) {
          (queryParams[key] as string[]).push(value);
        } else {
          queryParams[key] = [queryParams[key] as string, value];
        }
      } else {
        queryParams[key] = value;
      }
    });

    return {
      success: true,
      href: parsed.href,
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      host: parsed.host,
      pathname: parsed.pathname,
      search: parsed.search,
      searchParams: queryParams,
      hash: parsed.hash,
      origin: parsed.origin
    };
  }
};
