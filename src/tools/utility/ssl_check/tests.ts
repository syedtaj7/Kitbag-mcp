import { tool } from './tool.js';
import assert from 'assert';
import tls from 'tls';

export async function runTests() {
  const originalConnect = tls.connect;
  try {
    (tls as any).connect = (options: any, callback: () => void) => {
      const mockSocket = {
        getPeerCertificate: () => ({
          subject: { CN: "mock-host.com" },
          issuer: { CN: "Mock Authority" },
          valid_from: "Jul 1 00:00:00 2026 GMT",
          valid_to: "Sep 30 00:00:00 2030 GMT"
        }),
        end: () => {},
        on: () => {},
        setTimeout: () => {}
      };
      
      setTimeout(() => callback(), 10);
      return mockSocket;
    };

    const result = await tool.handler({ host: "mock-host.com" });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.host, "mock-host.com");
    assert.strictEqual(result.subject.CN, "mock-host.com");
    assert.strictEqual(result.issuer.CN, "Mock Authority");
    assert.strictEqual(result.isExpired, false);
    assert.ok(result.daysRemaining > 0);
  } finally {
    tls.connect = originalConnect;
  }
}
