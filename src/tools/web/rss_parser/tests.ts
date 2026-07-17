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
          <?xml version="1.0" encoding="UTF-8" ?>
          <rss version="2.0">
            <channel>
              <title>Mock RSS Feed</title>
              <description>A test description</description>
              <link>https://example.com/feed</link>
              <item>
                <title>Test Item 1</title>
                <link>https://example.com/item1</link>
                <description>Content description 1</description>
                <pubDate>Fri, 17 Jul 2026 12:00:00 GMT</pubDate>
              </item>
            </channel>
          </rss>
        `
      } as Response;
    };

    const result = await tool.handler({ url: "https://example.com/feed.xml" });
    assert.strictEqual(result.feedInfo.title, "Mock RSS Feed");
    assert.strictEqual(result.feedInfo.description, "A test description");
    assert.strictEqual(result.itemCount, 1);
    assert.strictEqual(result.items[0].title, "Test Item 1");
    assert.strictEqual(result.items[0].link, "https://example.com/item1");
  } finally {
    globalThis.fetch = originalFetch;
  }
}
