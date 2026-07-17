# web.dns_lookup

Perform DNS resolution for a domain (A, AAAA, MX, TXT, CNAME, NS, SOA).

## Usage

Provide the `domain` and optional `rrtype`.

### Input Schema

- `domain` (string, required): Domain to lookup.
- `rrtype` (string, optional): Record type (e.g. 'A', 'MX'). Defaults to 'A'.
