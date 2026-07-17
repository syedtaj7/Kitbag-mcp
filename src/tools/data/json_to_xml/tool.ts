import { ToolDefinition } from '../../../registry/registry.js';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function jsonToXml(obj: any, key: string): string {
  if (obj === null || obj === undefined) {
    return `<${key}/>`;
  }

  if (typeof obj !== 'object') {
    return `<${key}>${escapeXml(String(obj))}</${key}>`;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => jsonToXml(item, key)).join('');
  }

  let xml = `<${key}`;
  let children = '';

  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('@')) {
      xml += ` ${k.substring(1)}="${escapeXml(String(v))}"`;
    } else if (k === '_text') {
      children += escapeXml(String(v));
    } else {
      children += jsonToXml(v, k);
    }
  }

  if (children) {
    xml += `>${children}</${key}>`;
  } else {
    xml += `/>`;
  }

  return xml;
}

export const tool: ToolDefinition = {
  name: "data.json_to_xml",
  description: "Convert a JSON object to an XML text string.",
  inputSchema: {
    type: "object",
    properties: {
      jsonData: {
        type: "string",
        description: "The JSON string representation of the object to convert."
      },
      rootName: {
        type: "string",
        description: "Optional root element name. Defaults to 'root' if input is an array or string.",
        default: "root"
      }
    },
    required: ["jsonData"]
  },
  handler: async (args: { jsonData: string; rootName?: string }) => {
    let parsed: any;
    try {
      parsed = JSON.parse(args.jsonData);
    } catch (e: any) {
      throw new Error(`Failed to parse input as JSON: ${e.message}`);
    }

    const rootName = args.rootName || 'root';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';

    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed);
      if (keys.length === 1) {
        xml += jsonToXml(parsed[keys[0]], keys[0]);
      } else {
        xml += jsonToXml(parsed, rootName);
      }
    } else {
      xml += jsonToXml(parsed, rootName);
    }

    return {
      xml
    };
  }
};
