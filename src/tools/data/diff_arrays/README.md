# data.diff_arrays

Compare two JSON arrays of objects and return the differences (added, deleted, modified, unchanged).

## Usage

Provide the baseline `arrayA` and the updated `arrayB` in JSON string formats.

### Input Schema

- `arrayA` (string, required): Baseline JSON array.
- `arrayB` (string, required): Updated JSON array to compare against A.
- `key` (string, optional): Key property name to match items (e.g. 'id').
