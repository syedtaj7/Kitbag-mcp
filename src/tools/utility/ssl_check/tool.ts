import tls from 'tls';
import { ToolDefinition } from '../../../registry/registry.js';

export const tool: ToolDefinition = {
  name: "utility.ssl_check",
  description: "Retrieve SSL certificate details (expiration, issuer, subject) for a given domain/host.",
  inputSchema: {
    type: "object",
    properties: {
      host: { type: "string", description: "The hostname or domain to query (e.g. 'google.com')." },
      port: { type: "number", description: "The port number. Defaults to 443.", default: 443 }
    },
    required: ["host"]
  },
  handler: async (args: { host: string; port?: number }) => {
    const host = args.host.trim();
    const port = args.port || 443;

    return new Promise((resolve, reject) => {
      const socket = tls.connect({
        host,
        port,
        servername: host,
        // codeql[js/disabling-certificate-validation] - This tool retrieves certificate details, so we must allow connection to invalid/expired hosts.
        rejectUnauthorized: false
      }, () => {
        const cert = socket.getPeerCertificate(true);
        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          reject(new Error(`Could not retrieve SSL certificate for ${host}:${port}`));
          return;
        }

        const validFrom = cert.valid_from ? new Date(cert.valid_from).toISOString() : "";
        const validTo = cert.valid_to ? new Date(cert.valid_to).toISOString() : "";
        const daysRemaining = cert.valid_to
          ? Math.max(0, Math.ceil((new Date(cert.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 0;

        resolve({
          success: true,
          host,
          port,
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom,
          validTo,
          daysRemaining,
          isExpired: daysRemaining === 0
        });
      });

      socket.on('error', (err) => {
        reject(new Error(`TLS connection error: ${err.message}`));
      });

      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error("TLS connection timed out"));
      });
    });
  }
};
