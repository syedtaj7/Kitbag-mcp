# pdf.split

Split a PDF file into separate pages or custom page ranges.

## Usage

Provide the file data/path and optional page ranges.

### Input Schema

- `filePath` (string, optional): Local filesystem path to the PDF.
- `fileData` (string, optional): Base64 encoded PDF file data.
- `pages` (string, optional): Comma-separated page numbers or ranges (e.g., "1", "2-5", "1,3,5").
