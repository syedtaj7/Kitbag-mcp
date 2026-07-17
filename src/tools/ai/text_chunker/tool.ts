import { ToolDefinition } from '../../../registry/registry.js';

function chunkText(text: string, chunkSize: number, chunkOverlap: number, strategy: string): string[] {
  if (!text) return [];
  if (chunkSize <= 0) throw new Error("chunkSize must be greater than 0");
  if (chunkOverlap < 0 || chunkOverlap >= chunkSize) throw new Error("chunkOverlap must be non-negative and less than chunkSize");

  let items: string[] = [];
  let separator = '';

  if (strategy === 'character') {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start += chunkSize - chunkOverlap;
      if (start >= text.length || chunkSize - chunkOverlap <= 0) break;
    }
    return chunks;
  } else if (strategy === 'word') {
    items = text.split(/\s+/);
    separator = ' ';
  } else if (strategy === 'sentence') {
    // Regex matching simple sentence boundaries (keeping formatting/spacing)
    items = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
    separator = '';
  } else {
    // Default to paragraph
    items = text.split(/\n\s*\n+/);
    separator = '\n\n';
  }

  const chunks: string[] = [];
  let currentChunkItems: string[] = [];
  let currentLength = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemLen = item.length + (currentChunkItems.length > 0 ? separator.length : 0);

    if (currentLength + itemLen <= chunkSize) {
      currentChunkItems.push(item);
      currentLength += itemLen;
    } else {
      if (currentChunkItems.length > 0) {
        chunks.push(currentChunkItems.join(separator));
      }
      
      // Compute overlap backtrack
      const overlapItems: string[] = [];
      let overlapLen = 0;
      let j = i - 1;
      
      while (j >= 0 && currentChunkItems.includes(items[j])) {
        const oItem = items[j];
        const oLen = oItem.length + (overlapItems.length > 0 ? separator.length : 0);
        if (overlapLen + oLen <= chunkOverlap) {
          overlapItems.unshift(oItem);
          overlapLen += oLen;
          j--;
        } else {
          break;
        }
      }

      currentChunkItems = [...overlapItems, item];
      currentLength = overlapLen + item.length + (overlapItems.length > 0 ? separator.length : 0);

      // Push oversized items directly
      if (currentLength > chunkSize) {
        chunks.push(currentChunkItems.join(separator));
        currentChunkItems = [];
        currentLength = 0;
      }
    }
  }

  if (currentChunkItems.length > 0) {
    chunks.push(currentChunkItems.join(separator));
  }

  return chunks;
}

export const tool: ToolDefinition = {
  name: "ai.text_chunker",
  description: "Split large text into smaller semantic chunks for LLM context optimization or vector databases (RAG).",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The input text to chunk."
      },
      chunkSize: {
        type: "number",
        description: "The maximum character size of each chunk. Defaults to 1000.",
        default: 1000
      },
      chunkOverlap: {
        type: "number",
        description: "The number of overlapping characters between consecutive chunks. Defaults to 200.",
        default: 200
      },
      strategy: {
        type: "string",
        description: "The chunking strategy: 'character', 'word', 'sentence', or 'paragraph'. Defaults to 'paragraph'.",
        enum: ["character", "word", "sentence", "paragraph"],
        default: "paragraph"
      }
    },
    required: ["text"]
  },
  handler: async (args: { text: string; chunkSize?: number; chunkOverlap?: number; strategy?: string }) => {
    const chunkSize = args.chunkSize ?? 1000;
    const chunkOverlap = args.chunkOverlap ?? 200;
    const strategy = args.strategy || 'paragraph';

    const chunks = chunkText(args.text, chunkSize, chunkOverlap, strategy);
    return {
      chunks: chunks.map((content, index) => ({
        index,
        content,
        length: content.length
      })),
      count: chunks.length
    };
  }
};
