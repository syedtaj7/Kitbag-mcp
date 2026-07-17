# utility.qr_generate

Generate a QR code for a given text or URL, returning a base64 Data URL or saving to a file.

## Usage

Provide the `text` to encode. Optionally provide `outputPath` to save as a `.png` file.

### Input Schema

- `text` (string, required): The content (text or URL) to encode in the QR code.
- `outputPath` (string, optional): Optional local path where the QR code image (.png) should be saved.
