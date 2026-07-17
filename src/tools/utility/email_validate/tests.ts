import { tool } from './tool.js';
import assert from 'assert';
import dns from 'dns';

export async function runTests() {
  const dnsPromises = dns.promises;
  const originalResolveMx = dnsPromises.resolveMx;

  try {
    dnsPromises.resolveMx = async (domain: string) => {
      return [{ exchange: "mail.example.com", priority: 10 }];
    };

    const validResult = await tool.handler({ email: "test@example.com" });
    assert.strictEqual(validResult.success, true);
    assert.strictEqual(validResult.isValid, true);
    assert.strictEqual(validResult.syntax.domain, "example.com");
    assert.strictEqual(validResult.dns.hasMxRecords, true);

    const invalidResult = await tool.handler({ email: "invalid-email" });
    assert.strictEqual(invalidResult.isValid, false);
  } finally {
    dnsPromises.resolveMx = originalResolveMx;
  }
}
