# developer.mermaid_generate

Format and construct a syntax-valid Mermaid diagram markup.

## Usage

Provide the diagram `type` and its connector `elements`.

### Input Schema

- `type` (string, required): Diagram type ('flowchart', 'sequence', 'class', 'er').
- `title` (string, optional): Title.
- `elements` (array, required): Array of connection definitions.
