import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "developer.markdown_lint",
  description: "Lint Markdown text for common format, structural, and style violations.",
  inputSchema: {
    type: "object",
    properties: {
      markdown: {
        type: "string",
        description: "The raw Markdown content to lint."
      }
    },
    required: ["markdown"]
  },
  handler: async (args: { markdown: string }) => {
    const lines = args.markdown.split(/\r?\n/);
    const violations: Array<{ line: number; rule: string; description: string; content: string }> = [];

    let firstHeaderFound = false;
    let lastHeaderLevel = 0;
    let consecutiveBlanks = 0;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      }

      if (inCodeBlock) continue;

      if (line.length > 0 && line.endsWith(' ') && !line.endsWith('  ')) {
        violations.push({
          line: lineNum,
          rule: "MD003",
          description: "Line contains trailing whitespace",
          content: line
        });
      }

      if (line.trim() === '') {
        consecutiveBlanks++;
        if (consecutiveBlanks > 2) {
          violations.push({
            line: lineNum,
            rule: "MD004",
            description: "Too many consecutive blank lines",
            content: ""
          });
        }
      } else {
        consecutiveBlanks = 0;
      }

      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        if (!firstHeaderFound) {
          firstHeaderFound = true;
          if (level !== 1) {
            violations.push({
              line: lineNum,
              rule: "MD002",
              description: "First header in the document should be a Level 1 Heading (#)",
              content: line
            });
          }
        } else {
          if (level > lastHeaderLevel + 1) {
            violations.push({
              line: lineNum,
              rule: "MD001",
              description: `Heading levels should only increment by one. Expected level ${lastHeaderLevel + 1} or lower, got ${level}`,
              content: line
            });
          }
        }
        lastHeaderLevel = level;
      }
    }

    if (inCodeBlock) {
      violations.push({
        line: lines.length,
        rule: "MD005",
        description: "Document contains an unclosed code block (```)",
        content: ""
      });
    }

    return {
      success: true,
      isValid: violations.length === 0,
      violationCount: violations.length,
      violations
    };
  }
};
