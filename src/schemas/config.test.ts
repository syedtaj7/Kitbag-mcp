import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs';

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.KITBAG_ENABLED_MODULES;
  delete process.env.KITBAG_ENABLED_TOOLS;
  delete process.env.TOOLBOX_ENABLED_MODULES;
  delete process.env.TOOLBOX_ENABLED_TOOLS;
});

describe('config', () => {
  it('loads command line overrides and appends developer when all standard modules are enabled', async () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((filePath: fs.PathLike) => filePath === 'custom-config.json');
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ enabledModules: ['web'], defaultTimeoutMs: 12345 }));

    const originalArgv = process.argv;
    process.argv = ['node', 'script', '--config', 'custom-config.json', '--enabled-modules', 'pdf,web,image,data,utility,ai'];

    const { loadConfig } = await import('./config.js');
    const config = loadConfig();

    expect(config.enabledModules).toEqual(['pdf', 'web', 'image', 'data', 'utility', 'ai', 'developer']);
    expect(config.defaultTimeoutMs).toBe(12345);

    process.argv = originalArgv;
  });

  it('loads enabled tools from environment variables', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    process.env.KITBAG_ENABLED_TOOLS = 'utility.url_parser,data.csv_to_json';

    const originalArgv = process.argv;
    process.argv = ['node', 'script'];

    const { loadConfig } = await import('./config.js');
    const config = loadConfig();

    expect(config.enabledTools).toEqual(['utility.url_parser', 'data.csv_to_json']);

    process.argv = originalArgv;
  });
});
