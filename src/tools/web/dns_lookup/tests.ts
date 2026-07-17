import { tool } from './tool.js';
import assert from 'assert';
import dns from 'dns';

export async function runTests() {
  const dnsPromises = dns.promises;
  const originalResolve4 = dnsPromises.resolve4;
  
  try {
    (dnsPromises as any).resolve4 = async (hostname: string) => {
      return ["1.2.3.4"];
    };

    const result = await tool.handler({ domain: "example.com", rrtype: "A" });
    assert.strictEqual(result.domain, "example.com");
    assert.strictEqual(result.rrtype, "A");
    assert.deepStrictEqual(result.records, ["1.2.3.4"]);
  } finally {
    dnsPromises.resolve4 = originalResolve4;
  }
}
