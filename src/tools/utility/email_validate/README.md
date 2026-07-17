# utility.email_validate

Validate email format and check if the domain has configured mail exchange (MX) DNS records.

## Usage

Provide the `email` address.

### Input Schema

- `email` (string, required): Email address.
- `checkMx` (boolean, optional): Performs DNS validation. Defaults to true.
