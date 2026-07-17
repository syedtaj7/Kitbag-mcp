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
            <body>
              <a href="/about">About Us</a>
              <a href="https://external.com/help">Get Help</a>
              <a href="#section">Jump</a>
            </body>
          </html>
        `
      } as Response;
    };

    const result = await tool.handler({ url: "https://example.com" });
    assert.strictEqual(result.linkCount, 2);
    assert.strictEqual(result.links[0].url, "https://example.com/about");
    assert.strictEqual(result.links[0].isExternal, false);
    assert.strictEqual(result.links[1].url, "https://external.com/help");
    assert.strictEqual(result.links[1].isExternal, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
}
