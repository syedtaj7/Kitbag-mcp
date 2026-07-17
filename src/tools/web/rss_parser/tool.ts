import * as cheerio from 'cheerio';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "web.rss_parser",
  description: "Parse an RSS or Atom feed XML URL and return feed items in a structured JSON array.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL of the RSS/Atom feed."
      }
    },
    required: ["url"]
  },
  handler: async (args: { url: string }) => {
    const response = await fetch(args.url, {
      headers: {
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${args.url} (Status: ${response.status})`);
    }

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const feedTitle = $('channel > title, feed > title').first().text() || '';
    const feedDescription = $('channel > description, feed > subtitle').first().text() || '';
    const feedLink = $('channel > link, feed > link').first().text() || $('feed > link').attr('href') || '';

    const items: any[] = [];

    $('item').each((_, el) => {
      const itemTitle = $(el).find('title').text();
      const itemLink = $(el).find('link').text();
      const itemDesc = $(el).find('description').text();
      const itemPubDate = $(el).find('pubDate, dc\\:date').text();

      items.push({
        title: itemTitle.trim(),
        link: itemLink.trim(),
        description: itemDesc.trim(),
        pubDate: itemPubDate.trim()
      });
    });

    if (items.length === 0) {
      $('entry').each((_, el) => {
        const itemTitle = $(el).find('title').text();
        const itemLink = $(el).find('link').attr('href') || $(el).find('link').text();
        const itemDesc = $(el).find('summary, content').text();
        const itemPubDate = $(el).find('updated, published').text();

        items.push({
          title: itemTitle.trim(),
          link: itemLink.trim(),
          description: itemDesc.trim(),
          pubDate: itemPubDate.trim()
        });
      });
    }

    return {
      feedInfo: {
        title: feedTitle.trim(),
        description: feedDescription.trim(),
        link: feedLink.trim()
      },
      itemCount: items.length,
      items
    };
  }
};
