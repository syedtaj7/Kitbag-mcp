# developer.diff_files

Compare two text contents (or files) and generate a Git-style line-by-line diff.

## Usage

Provide the original `contentA` and the updated `contentB`.

### Input Schema

- `contentA` (string, required): Baseline text.
- `contentB` (string, required): Modified text.
- `headerA` (string, optional): Original source indicator. Defaults to 'a'.
- `headerB` (string, optional): Modified source indicator. Defaults to 'b'.
