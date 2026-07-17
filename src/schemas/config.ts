import { z } from 'zod';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export const ConfigSchema = z.object({
  enabledModules: z.array(z.string()).optional(),
  enabledTools: z.array(z.string()).optional(),
  defaultTimeoutMs: z.number().default(30000),
  maxPayloadSizeBytes: z.number().default(52428800), // 50MB
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  let configFromFile: Partial<Config> = {};
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  let configPath = fs.existsSync('kitbag-config.json') ? 'kitbag-config.json' : 'toolbox-config.json';
  
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    configPath = args[configIndex + 1];
  }
  
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      configFromFile = JSON.parse(content);
    } catch (e) {
      console.error(`Failed to read config file at ${configPath}:`, e);
    }
  }

  // Load modules filter
  let enabledModules: string[] | undefined = undefined;
  const modulesIndex = args.indexOf('--enabled-modules');
  if (modulesIndex !== -1 && args[modulesIndex + 1]) {
    enabledModules = args[modulesIndex + 1].split(',').map(s => s.trim());
  } else if (process.env.KITBAG_ENABLED_MODULES) {
    enabledModules = process.env.KITBAG_ENABLED_MODULES.split(',').map(s => s.trim());
  } else if (process.env.TOOLBOX_ENABLED_MODULES) {
    enabledModules = process.env.TOOLBOX_ENABLED_MODULES.split(',').map(s => s.trim());
  } else if (configFromFile.enabledModules) {
    enabledModules = configFromFile.enabledModules;
  }

  // Auto-append 'developer' module if all other standard modules are present
  if (
    enabledModules &&
    enabledModules.includes('pdf') &&
    enabledModules.includes('web') &&
    enabledModules.includes('image') &&
    enabledModules.includes('data') &&
    enabledModules.includes('utility') &&
    enabledModules.includes('ai') &&
    !enabledModules.includes('developer')
  ) {
    enabledModules.push('developer');
  }

  // Load tools filter
  let enabledTools: string[] | undefined = undefined;
  const toolsIndex = args.indexOf('--enabled-tools');
  if (toolsIndex !== -1 && args[toolsIndex + 1]) {
    enabledTools = args[toolsIndex + 1].split(',').map(s => s.trim());
  } else if (process.env.KITBAG_ENABLED_TOOLS) {
    enabledTools = process.env.KITBAG_ENABLED_TOOLS.split(',').map(s => s.trim());
  } else if (process.env.TOOLBOX_ENABLED_TOOLS) {
    enabledTools = process.env.TOOLBOX_ENABLED_TOOLS.split(',').map(s => s.trim());
  } else if (configFromFile.enabledTools) {
    enabledTools = configFromFile.enabledTools;
  }

  return ConfigSchema.parse({
    ...configFromFile,
    enabledModules,
    enabledTools,
  });
}
