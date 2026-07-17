import * as cheerio from 'cheerio';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "web.sitemap_generator",
  description: "Fetch and parse a sitemap.xml URL, extracting all listed URLs.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The sitemap XML URL, or the homepage URL (the tool will auto-check standard sitemap paths if a page is passed)."
      }
    },
    required: ["url"]
  },
  handler: async (args: { url: string }) => {
    let targetUrl = args.url;
    if (!targetUrl.endsWith('.xml')) {
      try {
        const u = new URL(targetUrl);
        targetUrl = new URL('/sitemap.xml', u.origin).href;
      } catch (e) {
        // Fallback
      }
    }

    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap from: ${targetUrl} (Status: ${response.status})`);
    }

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const urls: string[] = [];
    $('loc').each((_, el) => {
      const locText = $(el).text().trim();
      if (locText) {
        urls.push(locText);
      }
    });

    return {
      sitemapUrl: targetUrl,
      urlCount: urls.length,
      urls
    };
  }
};
