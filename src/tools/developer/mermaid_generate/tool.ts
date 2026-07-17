import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "developer.mermaid_generate",
  description: "Format and construct a syntax-valid Mermaid diagram markup.",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        description: "The diagram type.",
        enum: ["flowchart", "sequence", "class", "er"]
      },
      title: { type: "string", description: "Optional title of the diagram." },
      elements: {
        type: "array",
        items: { type: "string" },
        description: "List of connection/definition lines (e.g. ['A --> B', 'B --> C'] for flowchart, ['Alice->>Bob: Hello' for sequence])."
      }
    },
    required: ["type", "elements"]
  },
  handler: async (args: { type: string; title?: string; elements: string[] }) => {
    let markup = "";
    if (args.title) {
      markup += `--- \ntitle: ${args.title}\n---\n`;
    }

    const type = args.type.toLowerCase();
    if (type === 'flowchart') {
      markup += "graph TD\n";
    } else if (type === 'sequence') {
      markup += "sequenceDiagram\n";
    } else if (type === 'class') {
      markup += "classDiagram\n";
    } else if (type === 'er') {
      markup += "erDiagram\n";
    }

    for (const el of args.elements) {
      markup += `  ${el}\n`;
    }

    return {
      success: true,
      diagram: markup.trim()
    };
  }
};
