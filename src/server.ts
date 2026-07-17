#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './schemas/config.js';
import { discoverTools, filterTools, ToolDefinition } from './registry/registry.js';
import { withTimeout } from './middleware/limiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const config = loadConfig();

  // Log to stderr to prevent corrupting stdout JSON-RPC
  console.error("Starting Kitbag MCP Server...");
  console.error(`Configuration: ${JSON.stringify(config)}`);

  const toolsDir = path.join(__dirname, 'tools');
  const allTools = await discoverTools(toolsDir);
  const enabledTools = filterTools(allTools, config.enabledModules, config.enabledTools);

  console.error(`Discovered ${allTools.length} total tools. Enabling ${enabledTools.length} tools.`);

  const server = new Server(
    {
      name: "kitbag-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const toolMap = new Map<string, ToolDefinition>();
  for (const tool of enabledTools) {
    const exposedName = tool.name.replace(/\./g, '_');
    toolMap.set(exposedName, tool);
  }

  // Register list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: enabledTools.map(t => ({
        name: t.name.replace(/\./g, '_'),
        description: t.description,
        inputSchema: t.inputSchema,
      }))
    };
  });

  // Register call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = toolMap.get(name);

    if (!tool) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Tool not found or not enabled: ${name}`
      );
    }

    const startTime = Date.now();
    try {
      const result = await withTimeout(
        tool.handler(args || {}),
        config.defaultTimeoutMs
      );

      const duration = Date.now() - startTime;
      console.error(`[TOOL SUCCESS] tool=${name} duration=${duration}ms`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (e: any) {
      const duration = Date.now() - startTime;
      console.error(`[TOOL FAILURE] tool=${name} duration=${duration}ms error=${e.message}`);
      
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Execution Error: ${e.message}`
          }
        ]
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Toolbox MCP Server running on Stdin/Stdout transport.");
}

run().catch((error) => {
  console.error("Fatal error during startup:", error);
  process.exit(1);
});
