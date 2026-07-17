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
          <html>
            <head>
              <title>Meta Test</title>
              <meta name="description" content="This is a test description">
              <meta name="keywords" content="test, metadata, cheerio">
              <meta property="og:title" content="OG Test Title">
              <meta property="og:image" content="https://example.com/image.png">
              <meta name="twitter:card" content="summary">
              <script type="application/ld+json">
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "Test Site"
                }
              </script>
            </head>
            <body></body>
          </html>
        `
      } as Response;
    };

    const result = await tool.handler({ url: "https://example.com" });
    assert.strictEqual(result.url, "https://example.com");
    assert.strictEqual(result.title, "Meta Test");
    assert.strictEqual(result.description, "This is a test description");
    assert.strictEqual(result.keywords, "test, metadata, cheerio");
    assert.strictEqual(result.openGraph.title, "OG Test Title");
    assert.strictEqual(result.openGraph.image, "https://example.com/image.png");
    assert.strictEqual(result.twitter.card, "summary");
    assert.strictEqual(result.jsonLd.length, 1);
    assert.strictEqual(result.jsonLd[0].name, "Test Site");
  } finally {
    globalThis.fetch = originalFetch;
  }
}
