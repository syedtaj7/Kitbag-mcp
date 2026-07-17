import * as cheerio from 'cheerio';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "web.extract_metadata",
  description: "Extract metadata, OpenGraph tags, Twitter cards, and JSON-LD structured data from a web page.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL of the webpage to extract metadata from."
      }
    },
    required: ["url"]
  },
  handler: async (args: { url: string }) => {
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

    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    const og: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property');
      const content = $(el).attr('content');
      if (property && content) {
        og[property.substring(3)] = content;
      }
    });

    const twitter: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name');
      const content = $(el).attr('content');
      if (name && content) {
        twitter[name.substring(8)] = content;
      }
    });

    const jsonLd: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).text();
        if (text) {
          jsonLd.push(JSON.parse(text));
        }
      } catch (e) {
        // Skip invalid JSON-LD
      }
    });

    return {
      url: args.url,
      title: title.trim(),
      description: description.trim(),
      keywords: keywords.trim(),
      openGraph: og,
      twitter: twitter,
      jsonLd: jsonLd
    };
  }
};
