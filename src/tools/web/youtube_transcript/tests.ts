import { tool } from './tool.js';
import assert from 'assert';

export async function runTests() {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : (url as any).url || url.toString();
      if (urlStr.includes("watch?v=")) {
        return {
          ok: true,
          status: 200,
          text: async () => `
            <html>
              <body>
                <script>
                  var ytInitialPlayerResponse = {
                    "captions": {
                      "playerCaptionsTracklistRenderer": {
                        "captionTracks": [
                          {
                            "baseUrl": "https://www.youtube.com/api/timedtext?v=test&lang=en",
                            "languageCode": "en",
                            "name": { "simpleText": "English" }
                          }
                        ]
                      }
                    }
                  };
                </script>
              </body>
            </html>
          `
        } as Response;
      } else if (urlStr.includes("timedtext")) {
        return {
          ok: true,
          status: 200,
          text: async () => `
            <?xml version="1.0" encoding="utf-8" ?>
            <transcript>
              <text start="0.0" dur="2.0">Hello World</text>
              <text start="2.0" dur="3.0">Second Caption Line</text>
            </transcript>
          `
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    };

    const result = await tool.handler({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    assert.strictEqual(result.videoId, "dQw4w9WgXcQ");
    assert.strictEqual(result.languageCode, "en");
    assert.strictEqual(result.transcript.length, 2);
    assert.strictEqual(result.transcript[0].text, "Hello World");
    assert.strictEqual(result.transcript[1].text, "Second Caption Line");
    assert.strictEqual(result.fullText, "Hello World Second Caption Line");
  } finally {
    globalThis.fetch = originalFetch;
  }
}
