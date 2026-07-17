import dns from 'dns';
const dnsPromises = dns.promises;
import { ToolDefinition } from '../../../registry/registry.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const tool: ToolDefinition = {
  name: "utility.email_validate",
  description: "Validate email format and check if the domain has configured mail exchange (MX) DNS records.",
  inputSchema: {
    type: "object",
    properties: {
      email: {
        type: "string",
        description: "The email address to validate."
      },
      checkMx: {
        type: "boolean",
        description: "Whether to perform a DNS MX lookup to verify the domain has a mail server. Defaults to true.",
        default: true
      }
    },
    required: ["email"]
  },
  handler: async (args: { email: string; checkMx?: boolean }) => {
    const email = args.email.trim();
    const checkMx = args.checkMx !== false;

    const isSyntaxValid = emailRegex.test(email);
    if (!isSyntaxValid) {
      return {
        success: true,
        email,
        isValid: false,
        reason: "Invalid email syntax format"
      };
    }

    const domain = email.split('@')[1];
    let hasMxRecords = false;
    let mxRecords: any[] = [];
    let domainLookupSuccess = false;

    if (checkMx) {
      try {
        mxRecords = await dnsPromises.resolveMx(domain);
        hasMxRecords = mxRecords.length > 0;
        domainLookupSuccess = true;
      } catch (e: any) {
        domainLookupSuccess = false;
      }
    }

    const isValid = checkMx ? (domainLookupSuccess && hasMxRecords) : true;

    return {
      success: true,
      email,
      isValid,
      syntax: {
        valid: true,
        localPart: email.split('@')[0],
        domain
      },
      dns: checkMx ? {
        checked: true,
        success: domainLookupSuccess,
        hasMxRecords,
        mxRecords
      } : {
        checked: false
      }
    };
  }
};
