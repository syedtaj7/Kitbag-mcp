# ai.text_chunker

Split large text into smaller semantic chunks for LLM context window optimization or vector databases (RAG).

## Usage

Provide the `text` to split, along with chunk configuration settings.

### Input Schema

- `text` (string, required): The input text to chunk.
- `chunkSize` (number, optional): The maximum character size of each chunk. Defaults to 1000.
- `chunkOverlap` (number, optional): The number of overlapping characters between consecutive chunks. Defaults to 200.
- `strategy` (string, optional): The chunking strategy: 'character', 'word', 'sentence', or 'paragraph'. Defaults to 'paragraph'.
