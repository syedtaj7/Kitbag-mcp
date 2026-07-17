import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "developer.regex_tester",
  description: "Test a regular expression against a string and return details about matches and capture groups.",
  inputSchema: {
    type: "object",
    properties: {
      regex: { type: "string", description: "The regular expression pattern (without wrapping slashes)." },
      text: { type: "string", description: "The string to test against the regex." },
      flags: { type: "string", description: "Regex flags (e.g. 'g', 'i', 'm'). Defaults to 'g'.", default: "g" }
    },
    required: ["regex", "text"]
  },
  handler: async (args: { regex: string; text: string; flags?: string }) => {
    const flags = args.flags || 'g';
    let re: RegExp;
    
    try {
      re = new RegExp(args.regex, flags);
    } catch (e: any) {
      throw new Error(`Invalid regular expression: ${e.message}`);
    }

    const matches: any[] = [];
    
    if (flags.includes('g')) {
      let match: RegExpExecArray | null;
      while ((match = re.exec(args.text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
        if (re.lastIndex === match.index) {
          re.lastIndex++;
        }
      }
    } else {
      const match = re.exec(args.text);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
      }
    }

    return {
      success: true,
      hasMatch: matches.length > 0,
      matchCount: matches.length,
      matches
    };
  }
};
