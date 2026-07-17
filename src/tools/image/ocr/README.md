# image.ocr

Extract text from an image (PNG, JPEG, etc.) using Tesseract OCR.

## Usage

Provide either `filePath` (a local path to the image) or `fileData` (a base64 string containing the raw image bytes).

### Input Schema

- `filePath` (string, optional): Local filesystem path to the image file.
- `fileData` (string, optional): Base64 encoded image data.
- `language` (string, optional): Language code for OCR (e.g., 'eng', 'spa', 'fra'). Defaults to 'eng'.
