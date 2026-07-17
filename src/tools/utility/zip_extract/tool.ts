import unzipper from 'unzipper';
import fs from 'fs';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "utility.zip_extract",
  description: "Extract a ZIP archive to a destination folder.",
  inputSchema: {
    type: "object",
    properties: {
      zipPath: { type: "string", description: "Local path to the ZIP archive file." },
      outputPath: { type: "string", description: "Destination directory path where files should be extracted." }
    },
    required: ["zipPath", "outputPath"]
  },
  handler: async (args: { zipPath: string; outputPath: string }) => {
    if (!fs.existsSync(args.zipPath)) {
      throw new Error(`ZIP file not found at: ${args.zipPath}`);
    }

    if (!fs.existsSync(args.outputPath)) {
      fs.mkdirSync(args.outputPath, { recursive: true });
    }

    await fs.createReadStream(args.zipPath)
      .pipe(unzipper.Extract({ path: args.outputPath }))
      .promise();

    return {
      success: true,
      message: `ZIP archive successfully extracted to ${args.outputPath}`
    };
  }
};
