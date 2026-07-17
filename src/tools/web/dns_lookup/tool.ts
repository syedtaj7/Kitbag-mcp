import dns from 'dns';
const dnsPromises = dns.promises;
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "web.dns_lookup",
  description: "Perform DNS resolution for a domain (A, AAAA, MX, TXT, CNAME, NS, SOA).",
  inputSchema: {
    type: "object",
    properties: {
      domain: {
        type: "string",
        description: "The domain name to lookup (e.g. 'google.com')."
      },
      rrtype: {
        type: "string",
        description: "Resource record type (e.g., 'A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA'). Defaults to 'A'.",
        enum: ["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA"],
        default: "A"
      }
    },
    required: ["domain"]
  },
  handler: async (args: { domain: string; rrtype?: string }) => {
    const rrtype = args.rrtype || 'A';
    
    let hostname = args.domain.trim();
    if (hostname.startsWith('http://')) hostname = hostname.substring(7);
    if (hostname.startsWith('https://')) hostname = hostname.substring(8);
    hostname = hostname.split('/')[0].split(':')[0];

    try {
      let records: any;
      if (rrtype === 'A') {
        records = await dnsPromises.resolve4(hostname);
      } else if (rrtype === 'AAAA') {
        records = await dnsPromises.resolve6(hostname);
      } else {
        records = await dnsPromises.resolve(hostname, rrtype);
      }

      return {
        domain: hostname,
        rrtype,
        records
      };
    } catch (e: any) {
      throw new Error(`DNS Lookup failed for ${hostname} (${rrtype}): ${e.message}`);
    }
  }
};
