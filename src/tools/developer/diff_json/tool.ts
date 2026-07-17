import { ToolDefinition } from '../../../registry/registry.js';

function getDiff(objA: any, objB: any, path = ""): { added: string[], deleted: string[], modified: string[] } {
  const added: string[] = [];
  const deleted: string[] = [];
  const modified: string[] = [];

  const keysA = new Set(Object.keys(objA || {}));
  const keysB = new Set(Object.keys(objB || {}));

  for (const k of keysA) {
    const currentPath = path ? `${path}.${k}` : k;
    if (!keysB.has(k)) {
      deleted.push(currentPath);
    } else {
      const valA = objA[k];
      const valB = objB[k];
      if (typeof valA === 'object' && valA !== null && typeof valB === 'object' && valB !== null && !Array.isArray(valA) && !Array.isArray(valB)) {
        const nested = getDiff(valA, valB, currentPath);
        added.push(...nested.added);
        deleted.push(...nested.deleted);
        modified.push(...nested.modified);
      } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
        modified.push(currentPath);
      }
    }
  }

  for (const k of keysB) {
    const currentPath = path ? `${path}.${k}` : k;
    if (!keysA.has(k)) {
      added.push(currentPath);
    }
  }

  return { added, deleted, modified };
}

export const tool: ToolDefinition = {
  name: "developer.diff_json",
  description: "Perform a structural, nested properties diff comparison between two JSON objects.",
  inputSchema: {
    type: "object",
    properties: {
      jsonA: { type: "string", description: "JSON string of the baseline object." },
      jsonB: { type: "string", description: "JSON string of the updated object." }
    },
    required: ["jsonA", "jsonB"]
  },
  handler: async (args: { jsonA: string; jsonB: string }) => {
    let objA: any;
    let objB: any;
    try {
      objA = JSON.parse(args.jsonA);
      objB = JSON.parse(args.jsonB);
    } catch (e: any) {
      throw new Error(`Failed to parse input JSONs: ${e.message}`);
    }

    if (typeof objA !== 'object' || typeof objB !== 'object' || objA === null || objB === null || Array.isArray(objA) || Array.isArray(objB)) {
      throw new Error("Both jsonA and jsonB must parse to key-value objects.");
    }

    const { added, deleted, modified } = getDiff(objA, objB);

    return {
      success: true,
      hasChanges: added.length > 0 || deleted.length > 0 || modified.length > 0,
      added,
      deleted,
      modified
    };
  }
};
