# data.csv_to_json

Convert a CSV file or CSV string data to a JSON array.

## Usage

Provide either `filePath` (a local path to the CSV file) or `csvData` (inline raw CSV text).

### Input Schema

- `filePath` (string, optional): Local filesystem path to the CSV file.
- `csvData` (string, optional): Raw CSV string data to parse.
- `delimiter` (string, optional): The field delimiter character (e.g. `,`, `;`, `\t`). Defaults to `,`.
- `columns` (boolean, optional): If true, outputs objects with headers as keys. Otherwise, outputs arrays of cells. Defaults to true.
