import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => `
          <?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
              <loc>https://example.com/</loc>
              <priority>1.0</priority>
            </url>
            <url>
              <loc>https://example.com/about</loc>
              <priority>0.8</priority>
            </url>
          </urlset>
        `
      } as Response;
    };

    const result = await tool.handler({ url: "https://example.com" });
    assert.strictEqual(result.sitemapUrl, "https://example.com/sitemap.xml");
    assert.strictEqual(result.urlCount, 2);
    assert.strictEqual(result.urls[0], "https://example.com/");
    assert.strictEqual(result.urls[1], "https://example.com/about");
  } finally {
    globalThis.fetch = originalFetch;
  }
}
