# pdf.convert_to_markdown

Extract text from a PDF file and apply layout heuristics to format it into Markdown.

## Usage

Provide either `filePath` (a local path to the PDF) or `fileData` (a base64 string containing the raw PDF bytes).

### Input Schema

- `filePath` (string, optional): Local filesystem path to the PDF file.
- `fileData` (string, optional): Base64 encoded PDF file data.
