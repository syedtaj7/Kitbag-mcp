import { ToolDefinition } from '../../../registry/registry.js';

function computeDiff(linesA: string[], linesB: string[]): string[] {
  const diffLines: string[] = [];
  let i = 0;
  let j = 0;
  
  while (i < linesA.length || j < linesB.length) {
    if (i < linesA.length && j < linesB.length && linesA[i] === linesB[j]) {
      diffLines.push(`  ${linesA[i]}`);
      i++;
      j++;
    } else {
      let foundMatch = false;
      const lookahead = 5;
      
      for (let k = 1; k <= lookahead; k++) {
        if (i + k < linesA.length && linesA[i + k] === linesB[j]) {
          for (let d = 0; d < k; d++) {
            diffLines.push(`- ${linesA[i + d]}`);
          }
          i += k;
          foundMatch = true;
          break;
        }
        if (j + k < linesB.length && linesA[i] === linesB[j + k]) {
          for (let a = 0; a < k; a++) {
            diffLines.push(`+ ${linesB[j + a]}`);
          }
          j += k;
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        if (i < linesA.length && j < linesB.length) {
          diffLines.push(`- ${linesA[i]}`);
          diffLines.push(`+ ${linesB[j]}`);
          i++;
          j++;
        } else if (i < linesA.length) {
          diffLines.push(`- ${linesA[i]}`);
          i++;
        } else if (j < linesB.length) {
          diffLines.push(`+ ${linesB[j]}`);
          j++;
        }
      }
    }
  }
  return diffLines;
}

export const tool: ToolDefinition = {
  name: "developer.diff_files",
  description: "Compare two text contents (or files) and generate a Git-style line-by-line diff.",
  inputSchema: {
    type: "object",
    properties: {
      contentA: { type: "string", description: "The original text content." },
      contentB: { type: "string", description: "The modified text content to compare." },
      headerA: { type: "string", description: "Optional name of original source (defaults to 'a').", default: "a" },
      headerB: { type: "string", description: "Optional name of modified source (defaults to 'b').", default: "b" }
    },
    required: ["contentA", "contentB"]
  },
  handler: async (args: { contentA: string; contentB: string; headerA?: string; headerB?: string }) => {
    const linesA = args.contentA.split(/\r?\n/);
    const linesB = args.contentB.split(/\r?\n/);
    const hA = args.headerA || 'a';
    const hB = args.headerB || 'b';

    const diffLines = computeDiff(linesA, linesB);

    let diffText = `--- ${hA}\n+++ ${hB}\n`;
    diffText += diffLines.join('\n');

    return {
      success: true,
      diff: diffText,
      addedLines: diffLines.filter(l => l.startsWith('+')).length,
      deletedLines: diffLines.filter(l => l.startsWith('-')).length
    };
  }
};
