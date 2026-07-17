# utility.file_hash

Calculate the cryptographic hash (SHA-256, MD5, SHA-1) of a file or text string.

## Usage

Provide `text` or a `filePath`.

### Input Schema

- `text` (string, optional): Text to hash.
- `filePath` (string, optional): Local path to file.
- `algorithm` (string, optional): Checksum format. Defaults to 'sha256'.
