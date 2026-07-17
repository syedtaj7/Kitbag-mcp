# utility.uuid_generate

Generate a cryptographically secure UUID (v4/v1) or a secure random password.

## Usage

Provide optional `type` and `length`.

### Input Schema

- `type` (string, optional): Format type ('v4', 'v1', 'password'). Defaults to 'v4'.
- `length` (number, optional): Length of password. Defaults to 16.
