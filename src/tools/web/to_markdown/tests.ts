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
            <head><title>Test Page</title></head>
            <body>
              <nav>Menu link</nav>
              <main>
                <h1>Main Heading</h1>
                <p>This is a paragraph of the main content.</p>
              </main>
              <footer>Footer link</footer>
            </body>
          </html>
        `
      } as Response;
    };

    const result = await tool.handler({ url: "https://example.com" });
    assert.strictEqual(result.url, "https://example.com");
    assert.ok(result.markdown.includes("# Main Heading"), "Should contain main heading");
    assert.ok(result.markdown.includes("This is a paragraph"), "Should contain paragraph text");
    assert.ok(!result.markdown.includes("Menu link"), "Should strip navigation");
    assert.ok(!result.markdown.includes("Footer link"), "Should strip footer");
  } finally {
    globalThis.fetch = originalFetch;
  }
}
