import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "web.to_markdown",
  description: "Fetch a web page, clean up clutter (scripts, styles, footer, navigation), and convert the main body to Markdown.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL of the webpage to scrape and convert."
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

    // Clean up unnecessary elements
    $('script, style, noscript, iframe, svg, header, footer, nav, aside, .header, .footer, .nav, .menu, .sidebar, .ads, .advertisement').remove();

    // Prefer main or article if present, fallback to body
    const mainContent = $('main, article, #content, .content, .main').first();
    const targetHtml = mainContent.length ? mainContent.html() : $('body').html();

    if (!targetHtml) {
      throw new Error("Could not extract any content from the page.");
    }

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });

    const markdown = turndownService.turndown(targetHtml);

    return {
      url: args.url,
      markdown: markdown.trim()
    };
  }
};
