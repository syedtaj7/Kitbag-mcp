import * as cheerio from 'cheerio';
import { ToolDefinition } from '../../../registry/registry.js';

function nodeToJson(node: any): any {
  if (node.type === 'text') {
    return node.data.trim();
  }
  const children = node.children || [];
  if (children.length === 0) return '';
  
  if (children.length === 1 && children[0].type === 'text') {
    return children[0].data.trim();
  }

  const obj: any = {};
  for (const child of children) {
    if (child.type !== 'tag') continue;
    const childJson = nodeToJson(child);
    if (obj[child.name]) {
      if (!Array.isArray(obj[child.name])) {
        obj[child.name] = [obj[child.name]];
      }
      obj[child.name].push(childJson);
    } else {
      obj[child.name] = childJson;
    }
  }
  
  const attribs = node.attribs || {};
  if (Object.keys(attribs).length > 0) {
    const formattedAttribs: any = {};
    for (const [k, v] of Object.entries(attribs)) {
      formattedAttribs[`@${k}`] = v;
    }
    if (typeof obj === 'string') {
      return { _text: obj, ...formattedAttribs };
    } else {
      return { ...obj, ...formattedAttribs };
    }
  }
  
  return obj;
}

export const tool: ToolDefinition = {
  name: "data.xml_to_json",
  description: "Convert an XML string to a structured JSON object.",
  inputSchema: {
    type: "object",
    properties: {
      xml: {
        type: "string",
        description: "The XML text string to convert."
      }
    },
    required: ["xml"]
  },
  handler: async (args: { xml: string }) => {
    const $ = cheerio.load(args.xml, { xmlMode: true });
    const root = $.root().children().first().get(0);
    if (!root) {
      throw new Error("Invalid XML: No root element found.");
    }

    const name = (root as any).name;
    const json = nodeToJson(root);
    return {
      [name]: json
    };
  }
};
