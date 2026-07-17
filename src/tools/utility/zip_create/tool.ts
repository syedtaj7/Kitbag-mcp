import { ZipArchive } from 'archiver';
import fs from 'fs';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "utility.zip_create",
  description: "Compress files or folders into a single ZIP archive.",
  inputSchema: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Target path/name inside the zip archive." },
            content: { type: "string", description: "Inline text content for the file." },
            filePath: { type: "string", description: "Path to a local file to include." }
          },
          required: ["name"]
        },
        description: "List of files to include in the zip."
      },
      outputPath: { type: "string", description: "Local path where the zip file should be saved." }
    },
    required: ["files", "outputPath"]
  },
  handler: async (args: { files: Array<{ name: string; content?: string; filePath?: string }>; outputPath: string }) => {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(args.outputPath);
      const archive = new ZipArchive({ zlib: { level: 9 } });

      output.on('close', () => {
        resolve({
          success: true,
          outputPath: args.outputPath,
          sizeBytes: archive.pointer()
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      for (const f of args.files) {
        if (f.filePath) {
          archive.file(f.filePath, { name: f.name });
        } else if (f.content !== undefined) {
          archive.append(f.content, { name: f.name });
        }
      }

      archive.finalize();
    });
  }
};
