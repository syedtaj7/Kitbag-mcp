# pdf.merge

Merge multiple PDF files into a single PDF document.

## Usage

Provide a list of files to merge.

### Input Schema

- `files` (array, required): List of objects containing either `filePath` or `fileData` (base64).
- `outputPath` (string, optional): Local path to save the merged PDF.
