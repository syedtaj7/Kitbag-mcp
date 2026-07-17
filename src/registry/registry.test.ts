import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { discoverTools, filterTools, type ToolDefinition } from './registry.js';

describe('registry', () => {
  it('filters tools by explicit tool names and modules', () => {
    const tools: ToolDefinition[] = [
      { name: 'utility.url_parser', description: '', inputSchema: {}, handler: async () => null },
      { name: 'web.to_markdown', description: '', inputSchema: {}, handler: async () => null },
      { name: 'data.json_to_csv', description: '', inputSchema: {}, handler: async () => null }
    ];

    expect(filterTools(tools, ['utility'])).toEqual([tools[0]]);
    expect(filterTools(tools, undefined, ['web.to_markdown'])).toEqual([tools[1]]);
  });

  it('discovers nested tool modules from a directory tree', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kitbag-registry-'));
    const nestedDir = path.join(tempDir, 'sample');
    fs.mkdirSync(nestedDir, { recursive: true });

    fs.writeFileSync(
      path.join(nestedDir, 'tool.js'),
      [
        "export const tool = {",
        "  name: 'sample.tool',",
        "  description: 'sample',",
        "  inputSchema: {},",
        "  handler: async () => ({ success: true })",
        "};"
      ].join('\n'),
      'utf8'
    );

    const tools = await discoverTools(tempDir);
    expect(tools.map((tool) => tool.name)).toEqual(['sample.tool']);
  });
});
