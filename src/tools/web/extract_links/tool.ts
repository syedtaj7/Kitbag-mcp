import * as cheerio from 'cheerio';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "web.extract_links",
  description: "Scrape a webpage and extract all links with their anchor text, categorizing them as internal or external.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL of the webpage to scrape links from."
      },
      ignoreAnchorOnly: {
        type: "boolean",
        description: "If true, ignores anchor-only links (e.g., '#section'). Defaults to true.",
        default: true
      }
    },
    required: ["url"]
  },
  handler: async (args: { url: string; ignoreAnchorOnly?: boolean }) => {
    const response = await fetch(args.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${args.url} (Status: ${response.status} ${response.statusText})`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const origin = new URL(args.url).origin;
    const ignoreAnchors = args.ignoreAnchorOnly !== false;

    const links: Array<{ text: string; url: string; isExternal: boolean }> = [];
    const seen = new Set<string>();

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      
      if (!href) return;
      if (ignoreAnchors && href.startsWith('#')) return;
      if (href.startsWith('javascript:')) return;

      try {
        const absoluteUrl = new URL(href, args.url).href;
        if (seen.has(absoluteUrl)) return;
        seen.add(absoluteUrl);

        const isExternal = new URL(absoluteUrl).origin !== origin;
        links.push({
          text: text || "[No text]",
          url: absoluteUrl,
          isExternal
        });
      } catch (e) {
        // Skip invalid URLs
      }
    });

    return {
      url: args.url,
      linkCount: links.length,
      links
    };
  }
};
