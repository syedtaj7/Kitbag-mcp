# developer.sql_formatter

Format SQL queries to improve readability. Supports dialects like sql, mysql, postgresql, sqlite, plsql.

## Usage

Provide the raw `sql` query.

### Input Schema

- `sql` (string, required): Raw SQL query text.
- `dialect` (string, optional): SQL dialect family. Defaults to 'sql'.
