import fs from 'fs';
import path from 'path';

export interface ToolDefinition {
  name: string; // e.g., "pdf.convert_to_markdown"
  description: string;
  inputSchema: Record<string, any>;
  handler: (args: any) => Promise<any>;
}

export async function discoverTools(toolsDir: string): Promise<ToolDefinition[]> {
  const tools: ToolDefinition[] = [];
  if (!fs.existsSync(toolsDir)) {
    return tools;
  }

  async function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const toolTs = path.join(fullPath, 'tool.ts');
        const toolJs = path.join(fullPath, 'tool.js');
        if (fs.existsSync(toolTs) || fs.existsSync(toolJs)) {
          const fileToImport = fs.existsSync(toolTs) ? toolTs : toolJs;
          try {
            // Convert Windows absolute path to file:// URL for ESM dynamic import
            const fileUrl = `file://${fileToImport.replace(/\\/g, '/')}`;
            const module = await import(fileUrl);
            if (module.tool && typeof module.tool.handler === 'function') {
              tools.push(module.tool);
            }
          } catch (e) {
            console.error(`Failed to import tool from ${fileToImport}:`, e);
          }
        } else {
          await scan(fullPath);
        }
      }
    }
  }

  await scan(toolsDir);
  return tools;
}

export function filterTools(
  tools: ToolDefinition[],
  enabledModules?: string[],
  enabledTools?: string[]
): ToolDefinition[] {
  return tools.filter(tool => {
    // If specific tools are enabled, prioritize that check
    if (enabledTools && enabledTools.length > 0) {
      return enabledTools.includes(tool.name);
    }

    // Otherwise, check modules filter
    if (enabledModules && enabledModules.length > 0) {
      const [moduleName] = tool.name.split('.');
      return enabledModules.includes(moduleName);
    }

    // Default to including all tools
    return true;
  });
}
