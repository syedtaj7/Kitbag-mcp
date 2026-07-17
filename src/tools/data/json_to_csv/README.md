# data.json_to_csv

Convert a JSON array of objects to a CSV string.

## Usage

Provide either `filePath` (a local path to the JSON file) or `jsonData` (inline raw JSON text).

### Input Schema

- `filePath` (string, optional): Local filesystem path to the JSON file.
- `jsonData` (string, optional): Raw JSON string (must represent an array of objects) to convert.
- `delimiter` (string, optional): The field delimiter character to use (e.g. `,`, `;`, `\t`). Defaults to `,`.
