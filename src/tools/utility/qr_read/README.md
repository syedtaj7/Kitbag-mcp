# utility.qr_read

Decode a QR code from an image file or base64 image data.

## Usage

Provide either `filePath` (a local path to the image containing the QR code) or `fileData` (a base64 string containing the raw image bytes).

### Input Schema

- `filePath` (string, optional): Local filesystem path to the image file.
- `fileData` (string, optional): Base64 encoded image data.
