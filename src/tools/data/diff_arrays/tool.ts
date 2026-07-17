import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "data.diff_arrays",
  description: "Compare two JSON arrays of objects and return the differences (added, deleted, modified, unchanged).",
  inputSchema: {
    type: "object",
    properties: {
      arrayA: { type: "string", description: "JSON string representing the baseline array." },
      arrayB: { type: "string", description: "JSON string representing the updated array to compare against A." },
      key: { type: "string", description: "Optional unique key to match objects between arrays (e.g. 'id' or 'email')." }
    },
    required: ["arrayA", "arrayB"]
  },
  handler: async (args: { arrayA: string; arrayB: string; key?: string }) => {
    let listA: any[];
    let listB: any[];
    try {
      listA = JSON.parse(args.arrayA);
      listB = JSON.parse(args.arrayB);
    } catch (e: any) {
      throw new Error(`Failed to parse inputs as JSON: ${e.message}`);
    }

    if (!Array.isArray(listA) || !Array.isArray(listB)) {
      throw new Error("Both arrayA and arrayB must be JSON arrays.");
    }

    const key = args.key;
    const added: any[] = [];
    const deleted: any[] = [];
    const modified: any[] = [];
    const unchanged: any[] = [];

    if (key !== undefined) {
      const mapB = new Map<any, any>();
      for (const item of listB) {
        if (item && typeof item === 'object') {
          mapB.set(item[key], item);
        }
      }

      const matchedB = new Set<any>();

      for (const itemA of listA) {
        if (itemA && typeof itemA === 'object' && itemA[key] !== undefined) {
          const k = itemA[key];
          if (mapB.has(k)) {
            matchedB.add(k);
            const itemB = mapB.get(k);
            if (JSON.stringify(itemA) !== JSON.stringify(itemB)) {
              modified.push({ before: itemA, after: itemB });
            } else {
              unchanged.push(itemA);
            }
          } else {
            deleted.push(itemA);
          }
        } else {
          const str = JSON.stringify(itemA);
          const match = listB.find(itemB => JSON.stringify(itemB) === str);
          if (match) {
            unchanged.push(itemA);
          } else {
            deleted.push(itemA);
          }
        }
      }

      for (const itemB of listB) {
        if (itemB && typeof itemB === 'object' && itemB[key] !== undefined) {
          if (!matchedB.has(itemB[key])) {
            added.push(itemB);
          }
        } else {
          const str = JSON.stringify(itemB);
          if (!listA.some(itemA => JSON.stringify(itemA) === str)) {
            added.push(itemB);
          }
        }
      }
    } else {
      const setA = new Set(listA.map(x => JSON.stringify(x)));
      const setB = new Set(listB.map(x => JSON.stringify(x)));

      for (const item of listA) {
        if (setB.has(JSON.stringify(item))) {
          unchanged.push(item);
        } else {
          deleted.push(item);
        }
      }

      for (const item of listB) {
        if (!setA.has(JSON.stringify(item))) {
          added.push(item);
        }
      }
    }

    return {
      addedCount: added.length,
      deletedCount: deleted.length,
      modifiedCount: modified.length,
      unchangedCount: unchanged.length,
      added,
      deleted,
      modified,
      unchanged
    };
  }
};
